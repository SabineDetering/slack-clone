export class Thread {

    // type: string;
    channelID: string;
    threadID: string;
    firstMessageID?: string;
    answerAmount: number;

    constructor(obj?: any) {
        // this.type = obj ? obj.type : '';
        this.channelID = obj ? obj.channelID : '';
        this.threadID = obj ? obj.threadID : '';
        this.firstMessageID = obj ? obj.firstMessageID : '';
        this.answerAmount = obj ? obj.answerAmount : 0;
    }

    toJSON(){
         return {
            // type: this.type,
            channelID: this.channelID,
            threadID: this.threadID, 
            firstMessageID:   this.firstMessageID,
            answerAmount:   this.answerAmount,
        }
    }

}
