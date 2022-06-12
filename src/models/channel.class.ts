export class Channel {
    channelID: string;
    channelName: string;
    channelDescription: string;


    constructor(obj?: any) {
        this.channelID = obj ? obj.channelID : '';
        this.channelName = obj ? obj.channelName : 'New Channel';
        this.channelDescription = obj ? obj.channelDescription : 'Description';
    }

    toJSON() {
        return {
            channelID: this.channelID,
            channelName: this.channelName,
            channelDescription: this.channelDescription
        }
    }

}
