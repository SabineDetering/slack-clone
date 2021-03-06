export class Message {

    messageID: string;
    threadID: string;
    channelID: string;
    authorID: string;
    timestamp: any;
    messageText: string;
    images?: string[] ;  // as urls

    constructor(obj?: any) {
        this.messageID = obj ? obj.messageID : '';
        this.threadID = obj ? obj.threadID : '';
        this.channelID = obj ? obj.channelID : '';
        this.authorID = obj ? obj.authorID : '';
        this.timestamp = obj ? obj.timestamp : new Date().getTime();
        this.messageText = obj ? obj.messageText : '';
        this.images = obj ? obj.images : [];
    }

    toJSON(){
         return {
            messageID: this.messageID,
            threadID: this.threadID,
            channelID: this.channelID,
            authorID: this.authorID,
            timestamp: this.timestamp, 
            messageText: this.messageText,
            images: this.images,
                }
    }
}
