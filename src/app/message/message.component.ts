import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  @Input() thread!: Thread;
  /* public message: Message; */
  date: Date | undefined;
  messageAuthorName: string;
  fullsizeOpen: boolean = false;

  constructor(public Data: DataService) {}

  async ngOnInit(): Promise<void> {
    if(this.isAnswerMessage()){
      console.log('this is an answer message')
      this.getMessageTime();
      this.getMessageAuthorName();
    } else if(this.isFirstThreadMessage()){
      console.log('this is the first thread message')
      this.message = await this.Data.getMessageFromMessageId(
        this.thread.firstMessageID
      );
      this.getMessageTime();
      this.getMessageAuthorName();
    } else{
      this.message = new Message()  // generating empty message for displaying mainContainer when message deleted 
      this.message.messageText = 'This message has been deleted';
      this.messageAuthorName = 'unknown author';
    }


 /*    if (firstThreadMsgId != '' && firstThreadMsgId != 'deleted') {
      this.message = await this.Data.getMessageFromMessageId(
        this.thread.firstMessageID
      );
      this.getMessageTime();
      this.getMessageAuthorName();
    } else if (firstThreadMsgId == 'deleted') {
      this.message = new Message()  // generating empty message for displaying mainContainer when message deleted 
      this.message.messageText = 'This message has been deleted';
      this.messageAuthorName = 'unknown author';
    } else{
      this.getMessageTime();
      this.getMessageAuthorName();
    } */
  } 

  isAnswerMessage(){
    return this.message;
  }

  isFirstThreadMessage(){
    return this.thread.firstMessageID != '' && this.thread.firstMessageID != 'deleted'
  }

  getMessageTime() {
    this.date = new Date(this.message.timestamp);
  }

  // always get up to date Displayname from authors ID
  getMessageAuthorName() {
    if (this.message) {
      this.Data.getUserdataFromUserID(this.message.authorID).then((user) => {
        this.messageAuthorName = user.displayName || 'Guest';
      });
    }
  }
}
