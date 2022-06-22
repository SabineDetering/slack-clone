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
  @Input() firstMessageID: string = '';
  @Input() currentMessage: Message;
  @Input() thread: Thread;
  public message: Message;
  date: Date | undefined;
  messageAuthorName: string;
  fullsizeOpen: boolean = false;

  constructor(public Data: DataService) {}

  async ngOnInit(): Promise<void> {
    if (this.firstMessageID != '' && this.firstMessageID != 'deleted') {
      this.message = await this.Data.getMessageFromMessageId(
        this.firstMessageID
      );
      this.getMessageTime();
      this.getMessageAuthorName();
    } else if (this.firstMessageID == '') {
      this.message = this.currentMessage;
      this.getMessageTime();
      this.getMessageAuthorName();
    } else{
      this.message = new Message()  // generating empty message for displaying mainContainer when message deleted 
      this.message.messageText = 'This message has been deleted';
      this.messageAuthorName = 'unknown author';
    }
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
