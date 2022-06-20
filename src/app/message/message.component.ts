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
  date: Date;
  messageTime: string;
  messageAuthorName: string;

  constructor(
    public Data: DataService, 
) {}

  async ngOnInit(): Promise<void> {
    if (this.firstMessageID != '') {
      this.message = await this.Data.getMessageFromMessageId(
        this.firstMessageID
      );
    } else {
      this.message = this.currentMessage;
    }
    this.getMessageTime();
    this.getMessageAuthorName();
  }

  getMessageTime() {
    this.date = new Date(this.message.timestamp);
    /* this.messageTime = date.getHours() + ':' + (date.getMinutes()< 10 ? '0' : '') + date.getMinutes()  + ' Uhr'; */
  }

  // always get up to date Displayname from authors ID
  getMessageAuthorName(){ 
    if(this.message){
      this.Data.getUserdataFromUserID(this.message.authorID).then(user => {
      this.messageAuthorName = user.displayName || 'Guest'
    })
    }
  }

}
