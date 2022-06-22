import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  @Input() thread!: Thread;
  @Input() actionsType!: string;
  // currentChannel!: Channel;
  currentChannel: CurrentChannel;

  constructor(public router: Router, private Data: DataService) {}

  ngOnInit(): void {
    this.Data.currentChannel$.subscribe(
      (channel) => (this.currentChannel = channel)
    );
  }

  answerInThread() {
    this.Data.currentThread$.next(this.thread);
    this.Data.getMessagesFromThreadID(this.thread.threadID);
  }

  async deleteFirstThreadMessage() {
    console.log(this.thread.firstMessageID);
    let message = await this.Data.getMessageFromMessageId(
      this.thread.firstMessageID
    );
    console.log(message);
    message.messageText = 'This message has been deleted';
    this.Data.deleteMessage(this.thread.firstMessageID);
    this.thread.firstMessageID = 'deleted';
    this.Data.saveDocWithCustomID('threads', this.thread, this.thread.threadID);
    /* this.Data.saveDocWithCustomID('messages', message, message.messageID) */
  }
}
