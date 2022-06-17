export class User {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;


    constructor(obj?: any) {
        this.uid = obj ? obj.uid : '';
        this.displayName = obj ? obj.displayName : '';
        this.email = obj ? obj.email : '';
        this.photoURL = obj ? obj.photoURL : null;
    }

    toJSON() {
        return {
            uid: this.uid,
            displayName: this.displayName,
            email: this.email,
            photoURL: this.photoURL
        }
    }

}
