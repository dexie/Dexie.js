import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DXCAlert } from '../types/DXCAlert';
import { DXCInputField } from '../types/DXCInputField';
import { DXCUserInteraction } from '../types/DXCUserInteraction';

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
  while (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/.test(email)) {
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
