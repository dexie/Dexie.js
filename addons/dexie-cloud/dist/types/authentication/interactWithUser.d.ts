import { BehaviorSubject } from 'rxjs';
import { DXCAlert } from '../types/DXCAlert';
import { DXCInputField } from '../types/DXCInputField';
import { DXCUserInteraction } from '../types/DXCUserInteraction';
export interface DXCUserInteractionRequest {
    type: DXCUserInteraction['type'];
    title: string;
    alerts: DXCAlert[];
    fields: {
        [name: string]: DXCInputField;
    };
}
export declare function interactWithUser<T extends DXCUserInteractionRequest>(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, req: T): Promise<{
    [P in keyof T['fields']]: string;
}>;
export declare function alertUser(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, title: string, ...alerts: DXCAlert[]): Promise<{}>;
export declare function promptForEmail(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, title: string, emailHint?: string): Promise<string>;
export declare function promptForOTP(userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, email: string, alert?: DXCAlert): Promise<string>;
