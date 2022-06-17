export class Message {

    messageID: string;
    threadID: string;
    authorID: string;
    timestamp: any;
    messageText: string;
    images?: [];

    constructor(obj?: any) {
        this.messageID = obj ? obj.messageID : '';
        this.threadID = obj ? obj.threadID : '';
        this.authorID = obj ? obj.authorID : '';
        this.timestamp = obj ? obj.timestamp : new Date().getTime();
        this.messageText = obj ? obj.messageText : '';
        this.images = obj ? obj.images : [];
    }

    toJSON(){
         return {
            messageID: this.messageID,
            threadID: this.threadID,
            authorID: this.authorID,
            timestamp: this.timestamp, 
            messageText: this.messageText,
            images: this.images,
                }
    }
}
