export class Thread {

    // type: string;
    channelID: string;
    threadID: string;
    firstMessageID?: string;

    constructor(obj?: any) {
        // this.type = obj ? obj.type : '';
        this.channelID = obj ? obj.channelID : '';
        this.threadID = obj ? obj.threadID : '';
        this.firstMessageID = obj ? obj.firstMessageID : '';
    }

    toJSON(){
         return {
            // type: this.type,
            channelID: this.channelID,
            threadID: this.threadID, 
            firstMessageID:   this.firstMessageID,
        }
    }

}
