export class ThreadMsg {

    threadID: string;
    authorID: string;
    timestamp: any;
    messageText: string;
    images: [];

    constructor(obj?: any) {
        this.threadID = obj ? obj.threadID : '';
        this.authorID = obj ? obj.authorID : '';
        this.timestamp = obj ? obj.timestamp : '';
        this.messageText = obj ? obj.messageText : '';
        this.images = obj ? obj.images : [];
    }

    toJSON(){
         return {
            threadID: this.threadID,
            authorID: this.authorID,
            timestamp: this.timestamp, 
            messageTxt:   this.messageText,
            images: this.images,
                }
    }
}
