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
  fields: { [name: string]: DXCInputField; };
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
  }>(
    (resolve, reject) => {
      userInteraction.next({
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
          reject(new Dexie.AbortError());
        },
      } as DXCUserInteraction);
      // Start subscribing for external updates to db.cloud.userInteraction, and if so, cancel this request.
      const subscription = userInteraction.subscribe(()=>{
        subscription.unsubscribe();
        if (!done) {
          reject(new Dexie.AbortError());
        }
      });
    }
  );
}

export async function promptForEmail(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, title: string, emailHint?: string) {
  let email = emailHint || '';
  while (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
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
            type: 'text',
            label: 'Email',
            placeholder: 'somename@somedomain.com',
          },
        },
      })
    ).email;
  }
  return email;
}

export async function promptForOTP(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, email: string) {
  const { otp } = await interactWithUser(userInteraction, {
    type: 'otp',
    title: 'Enter OTP',
    alerts: [
      {
        type: 'info',
        messageCode: 'OTP_SENT',
        message: `A One-Time password has been sent to {email}`,
        messageParams: { email },
      },
    ],
    fields: {
      otp: {
        type: 'text',
        label: 'OTP',
        placeholder: 'Paste OTP here',
      },
    },
  });
  return otp;
}
