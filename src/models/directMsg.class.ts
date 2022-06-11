export class DirectMsg {
    directMsgID: string;
    directMsgMembers:string[];

    constructor(obj?: any) {
        this.directMsgID = obj ? obj.directMsgID : '';
        this.directMsgMembers = obj ? obj.directMsgMembers : [];
    }

    toJSON() {
        return {
            directMsgID: this.directMsgID,
            directMsgMembers: this.directMsgMembers
        }
    }

}
