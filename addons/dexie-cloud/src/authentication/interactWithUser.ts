import Dexie from 'dexie';
import type { OAuthProviderInfo } from 'dexie-cloud-common';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DXCAlert } from '../types/DXCAlert';
import { DXCInputField } from '../types/DXCInputField';
import { DXCUserInteraction, DXCGenericUserInteraction, DXCOption } from '../types/DXCUserInteraction';

/** Cache for fetched SVG content to avoid re-fetching */
const svgCache: Record<string, string> = {};

/** Default SVG icons for built-in OAuth providers */
const ProviderIcons: Record<string, string> = {
  google: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  microsoft: `<svg viewBox="0 0 24 24" width="20" height="20"><rect fill="#F25022" x="1" y="1" width="10" height="10"/><rect fill="#00A4EF" x="1" y="13" width="10" height="10"/><rect fill="#7FBA00" x="13" y="1" width="10" height="10"/><rect fill="#FFB900" x="13" y="13" width="10" height="10"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,
};

/** Email/envelope icon for OTP option */
const EmailIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6L12 13 2 6"/></svg>`;

/**
 * Fetches SVG content from a URL and caches it.
 * Returns the SVG string or null if fetch fails.
 */
async function fetchSvgIcon(url: string): Promise<string | null> {
  if (svgCache[url]) {
    return svgCache[url];
  }
  
  try {
    const res = await fetch(url);
    if (res.ok) {
      const svg = await res.text();
      // Validate it looks like SVG
      if (svg.includes('<svg')) {
        svgCache[url] = svg;
        return svg;
      }
    }
  } catch {
    // Silently fail - will show no icon
  }
  return null;
}

/**
 * Converts an OAuthProviderInfo to a generic DXCOption.
 * Fetches SVG icons from URLs if needed.
 */
async function providerToOption(provider: OAuthProviderInfo): Promise<DXCOption> {
  let iconSvg: string | undefined;
  
  // First check for built-in icons
  if (ProviderIcons[provider.type]) {
    iconSvg = ProviderIcons[provider.type];
  }
  // If provider has iconUrl pointing to SVG, fetch and inline it
  else if (provider.iconUrl?.toLowerCase().endsWith('.svg')) {
    const fetched = await fetchSvgIcon(provider.iconUrl);
    if (fetched) {
      iconSvg = fetched;
    }
  }
  
  return {
    name: 'provider',
    value: provider.name,
    displayName: `Continue with ${provider.displayName}`,
    iconSvg,
    // If iconUrl is not SVG, pass it through for img tag rendering
    iconUrl: (!iconSvg && provider.iconUrl) ? provider.iconUrl : undefined,
    // Use provider type as style hint for branding
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
  // Convert providers to generic options (with icon fetching)
  const providerOptions = await Promise.all(providers.map(providerToOption));
  
  // Build the options array
  const options: DXCOption[] = [...providerOptions];
  
  // Add OTP option if enabled
  if (otpEnabled) {
    options.push({
      name: 'otp',
      value: 'email',
      displayName: 'Continue with email',
      iconSvg: EmailIcon,
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
