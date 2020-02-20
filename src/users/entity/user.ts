export class User {
    username: string;
    email: string;
    accessGroups: string[];

    constructor(username: string, email: string, accessGroups: string[]) {
        this.username = username;
        this.email = email;
        this.accessGroups = accessGroups;
    }
}
