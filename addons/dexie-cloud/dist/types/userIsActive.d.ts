import { BehaviorSubject } from 'rxjs';
export declare const userIsActive: BehaviorSubject<boolean>;
export declare const visibilityStateIsChanged: import("rxjs").Observable<{}>;
export declare const documentBecomesHidden: import("rxjs").Observable<{}>;
export declare const documentBecomesVisible: import("rxjs").Observable<{}>;
export declare const userDoesSomething: import("rxjs").Observable<Event | {}>;
