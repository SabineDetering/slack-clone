export class DirectChannel {
    directChannelID: string;
    directChannelMembers: string[];
    directChannelName: string = '';//property is filled dynamically dependent on logged in user
    directChannelAvatar: string = '';//property is filled dynamically 

    constructor(obj?: any) {
        this.directChannelID = obj ? obj.directChannelID : '';
        this.directChannelMembers = obj ? obj.directChannelMembers : [];
    }


    toJSON() {
        return {
            // directChannelID: this.directChannelID,
            directChannelMembers: this.directChannelMembers
        }
    }

}
