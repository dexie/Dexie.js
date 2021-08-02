export interface Role {
    realmId: string;
    name: string;
    permissions: {
        add?: string[] | "*";
        update?: {
            [tableName: string]: string[] | "*";
        };
        manage?: string[] | "*";
    };
}
