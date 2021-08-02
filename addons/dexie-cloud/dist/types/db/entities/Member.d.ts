export interface Member {
    id?: string;
    realmId: string;
    userId?: string;
    email?: string;
    name?: string;
    invite?: boolean;
    invited?: Date;
    accepted?: Date;
    rejected?: Date;
    roles?: string[];
    permissions?: {
        add?: string[] | "*";
        update?: {
            [tableName: string]: string[] | "*";
        };
        manage?: string[] | "*";
    };
}
