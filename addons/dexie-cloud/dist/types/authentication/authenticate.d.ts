import type { TokenFinalResponse } from 'dexie-cloud-common';
import { BehaviorSubject } from 'rxjs';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { UserLogin } from '../db/entities/UserLogin';
import { DXCUserInteraction } from '../types/DXCUserInteraction';
export declare type FetchTokenCallback = (tokenParams: {
    public_key: string;
    hints?: {
        userId?: string;
        email?: string;
        grant_type?: string;
    };
}) => Promise<TokenFinalResponse>;
export declare function loadAccessToken(db: DexieCloudDB): Promise<string | undefined>;
export declare function authenticate(url: string, context: UserLogin, fetchToken: FetchTokenCallback, userInteraction: BehaviorSubject<DXCUserInteraction | undefined>, hints?: {
    userId?: string;
    email?: string;
    grant_type?: string;
}): Promise<UserLogin>;
export declare function refreshAccessToken(url: string, login: UserLogin): Promise<UserLogin>;
