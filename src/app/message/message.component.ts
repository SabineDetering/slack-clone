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
  message: Message;
  messageTime: string;

  constructor(public Data: DataService) {}

  async ngOnInit(): Promise<void> {
    if (this.firstMessageID != '') {
      this.message = await this.Data.getMessageFromMessageId(
        this.firstMessageID
      );
    } else {
      this.message = this.currentMessage;
    }
    this.getMessageTime();
  }

  getMessageTime() {
    const date = new Date(this.message.timestamp);
    this.messageTime = date.getHours() + ':' + date.getMinutes() + ' Uhr';
  }
}
