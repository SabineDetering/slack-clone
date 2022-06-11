export class User {
    userID: string;
    userName: string;
    userEmail: string;


    constructor(obj?: any) {
        this.userID = obj ? obj.userID : '';
        this.userName = obj ? obj.userName : '';
        this.userEmail = obj ? obj.userEmail : '';
    }

    toJSON() {
        return {
            userID: this.userID,
            userName: this.userName,
            userEmail: this.userEmail
        }
    }

}
