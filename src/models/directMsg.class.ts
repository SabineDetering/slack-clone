export class DirectMsg {
    directMsgID: string;
    directMsgName: string;
    directMsgMembers:string[];

    constructor(obj?: any) {
        this.directMsgID = obj ? obj.directMsgID : '';
        this.directMsgName = obj ? obj.directMsgName : '';
        this.directMsgMembers = obj ? obj.directMsgMembers : [];
    }

    toJSON() {
        return {
            directMsgID: this.directMsgID,
            directMsgName: this.directMsgName,
            directMsgMembers: this.directMsgMembers
        }
    }

}
