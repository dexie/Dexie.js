import Dexie from 'dexie';
import type { OAuthProviderInfo } from 'dexie-cloud-common';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DXCAlert } from '../types/DXCAlert';
import { DXCInputField } from '../types/DXCInputField';
import { DXCUserInteraction, DXCGenericUserInteraction, DXCOption } from '../types/DXCUserInteraction';

/** Email/envelope icon data URL for OTP option */
const EmailIcon = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#666666" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6L12 13 2 6"/></svg>')}`;

/**
 * Converts an OAuthProviderInfo to a generic DXCOption.
 */
function providerToOption(provider: OAuthProviderInfo): DXCOption {
  return {
    name: 'provider',
    value: provider.name,
    displayName: `Continue with ${provider.displayName}`,
    iconUrl: provider.iconUrl,
    styleHint: provider.type,
  };
}

export interface DXCUserInteractionRequest {
  type: DXCUserInteraction['type'];
  title: string;
  alerts: DXCAlert[];
  submitLabel?: string;
  cancelLabel?: string | null;
  fields: { [name: string]: DXCInputField };
}

export function interactWithUser<T extends DXCUserInteractionRequest>(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  req: T
): Promise<{
  [P in keyof T['fields']]: string;
}> {
  let done = false;
  return new Promise<{
    [P in keyof T['fields']]: string;
  }>((resolve, reject) => {
    const interactionProps = {
      submitLabel: 'Submit',
      cancelLabel: 'Cancel',
      ...req,
      onSubmit: (res: {
        [P in keyof T['fields']]: string;
      }) => {
        userInteraction.next(undefined);
        done = true;
        resolve(res);
      },
      onCancel: () => {
        userInteraction.next(undefined);
        done = true;
        reject(new Dexie.AbortError('User cancelled'));
      },
    } as DXCUserInteraction;
    userInteraction.next(interactionProps);
    // Start subscribing for external updates to db.cloud.userInteraction, and if so, cancel this request.
    /*const subscription = userInteraction.subscribe((currentInteractionProps) => {
      if (currentInteractionProps !== interactionProps) {
        if (subscription) subscription.unsubscribe();
        if (!done) {
          reject(new Dexie.AbortError("User cancelled"));
        }
      }
    });*/
  });
}

export function alertUser(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  title: string,
  ...alerts: DXCAlert[]
) {
  return interactWithUser(userInteraction, {
    type: 'message-alert',
    title,
    alerts,
    fields: {},
    submitLabel: 'OK',
    cancelLabel: null,
  });
}

export async function promptForEmail(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  title: string,
  emailHint?: string
) {
  let email = emailHint || '';
  // Regular expression for email validation
  // ^[\w-+.]+@([\w-]+\.)+[\w-]{2,10}(\sas\s[\w-+.]+@([\w-]+\.)+[\w-]{2,10})?$
  //
  // ^[\w-+.]+ : Matches the start of the string. Allows one or more word characters
  // (a-z, A-Z, 0-9, and underscore), hyphen, plus, or dot.
  //
  // @ : Matches the @ symbol.
  // ([\w-]+\.)+ : Matches one or more word characters or hyphens followed by a dot.
  //   The plus sign outside the parentheses means this pattern can repeat one or more times,
  //   allowing for subdomains.
  // [\w-]{2,10} : Matches between 2 and 10 word characters or hyphens. This is typically for
  //   the domain extension like .com, .net, etc.
  // (\sas\s[\w-+.]+@([\w-]+\.)+[\w-]{2,10})?$ : This part is optional (due to the ? at the end).
  //   If present, it matches " as " followed by another valid email address. This allows for the
  //   input to be either a single email address or two email addresses separated by " as ". 
  //
  // The use case for "<email1> as <email2>"" is for when a database owner with full access to the
  // database needs to impersonate another user in the database in order to troubleshoot. This
  // format will only be possible to use when email1 is the owner of an API client with GLOBAL_READ
  // and GLOBAL_WRITE permissions on the database. The email will be checked on the server before
  // allowing it and giving out a token for email2, using the OTP sent to email1.
  while (!email || !/^[\w-+.]+@([\w-]+\.)+[\w-]{2,10}(\sas\s[\w-+.]+@([\w-]+\.)+[\w-]{2,10})?$/.test(email)) {
    email = (
      await interactWithUser(userInteraction, {
        type: 'email',
        title,
        alerts: email
          ? [
              {
                type: 'error',
                messageCode: 'INVALID_EMAIL',
                message: 'Please enter a valid email address',
                messageParams: {},
              },
            ]
          : [],
        fields: {
          email: {
            type: 'email',
            placeholder: 'you@somedomain.com',
          },
        },
      })
    ).email;
  }
  return email;
}

export async function promptForOTP(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  email: string,
  alert?: DXCAlert
) {
  const alerts: DXCAlert[] = [
    {
      type: 'info',
      messageCode: 'OTP_SENT',
      message: `A One-Time password has been sent to {email}`,
      messageParams: { email },
    },
  ];
  if (alert) {
    alerts.push(alert);
  }
  const { otp } = await interactWithUser(userInteraction, {
    type: 'otp',
    title: 'Enter OTP',
    alerts,
    fields: {
      otp: {
        type: 'otp',
        label: 'OTP',
        placeholder: 'Paste OTP here',
      },
    },
  });
  return otp;
}

export async function confirmLogout(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  currentUserId: string,
  numUnsyncedChanges: number
) {
  const alerts: DXCAlert[] = [
    {
      type: 'warning',
      messageCode: 'LOGOUT_CONFIRMATION',
      message: `{numUnsyncedChanges} unsynced changes will get lost!
                Logout anyway?`,
      messageParams: {
        currentUserId,
        numUnsyncedChanges: numUnsyncedChanges.toString(),
      }
    },
  ];
  return await interactWithUser(userInteraction, {
    type: 'logout-confirmation',
    title: 'Confirm Logout',
    alerts,
    fields: {},
    submitLabel: 'Confirm logout',
    cancelLabel: 'Cancel'
  })
    .then(() => true)
    .catch(() => false);
}

/** Result from provider selection prompt */
export type ProviderSelectionResult =
  | { type: 'provider'; provider: string }
  | { type: 'otp' };

/**
 * Prompts the user to select an authentication method (OAuth provider or OTP).
 * 
 * This function converts OAuth providers and OTP option into generic DXCOption[]
 * for the DXCSelect interaction, handling icon fetching and style hints.
 * 
 * @param userInteraction - The user interaction BehaviorSubject
 * @param providers - Available OAuth providers
 * @param otpEnabled - Whether OTP is available
 * @param title - Dialog title
 * @param alerts - Optional alerts to display
 * @returns Promise resolving to the user's selection
 */
export async function promptForProvider(
  userInteraction: BehaviorSubject<DXCUserInteraction | undefined>,
  providers: OAuthProviderInfo[],
  otpEnabled: boolean,
  title: string = 'Choose login method',
  alerts: DXCAlert[] = []
): Promise<ProviderSelectionResult> {
  // Convert providers to generic options
  const providerOptions = providers.map(providerToOption);
  
  // Build the options array
  const options: DXCOption[] = [...providerOptions];
  
  // Add OTP option if enabled
  if (otpEnabled) {
    options.push({
      name: 'otp',
      value: 'email',
      displayName: 'Continue with email',
      iconUrl: EmailIcon,
      styleHint: 'otp',
    });
  }
  
  return new Promise<ProviderSelectionResult>((resolve, reject) => {
    const interactionProps: DXCGenericUserInteraction = {
      type: 'generic',
      title,
      alerts,
      options,
      fields: {},
      submitLabel: '', // No submit button - just options
      cancelLabel: 'Cancel',
      onSubmit: (params: { [key: string]: string }) => {
        userInteraction.next(undefined);
        // Check which option was selected
        if ('otp' in params) {
          resolve({ type: 'otp' });
        } else if ('provider' in params) {
          resolve({ type: 'provider', provider: params.provider });
        } else {
          // Unknown - default to OTP
          resolve({ type: 'otp' });
        }
      },
      onCancel: () => {
        userInteraction.next(undefined);
        reject(new Dexie.AbortError('User cancelled'));
      },
    };
    
    userInteraction.next(interactionProps);
  });
}
