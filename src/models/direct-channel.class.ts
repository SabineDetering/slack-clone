export class DirectChannel {
    directChannelID: string;
    directChannelName: string = '';
    directChannelMembers: string[];

    constructor(obj?: any) {
        this.directChannelID = obj ? obj.directChannelID : '';
        this.directChannelMembers = obj ? obj.directChannelMembers : [];
    }

    toJSON() {
        return {
            directChannelID: this.directChannelID,
            directChannelMembers: this.directChannelMembers
        }
    }

}
