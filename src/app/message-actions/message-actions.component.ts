import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  @Input() thread!: Thread;
  @Input() message!: Message;
  @Input() actionsType!: string;
  // currentChannel!: Channel;
/*   currentChannel: CurrentChannel;
 */
  constructor(public router: Router, private Data: DataService) {}

  async ngOnInit(): Promise<void> {
/*     this.Data.currentChannel$.subscribe(
      (channel) => (this.currentChannel = channel)
    ); */
    if (!this.message) {
      this.message = await this.Data.getMessageFromMessageId(
        this.thread.firstMessageID
      );
    }
  }

  answerInThread() {
    this.Data.currentThread$.next(this.thread);
    this.Data.getMessagesFromThreadID(this.thread.threadID);
  }

  deleteMessage() {
    console.log(this.thread)
    this.Data.deleteMessage(this.message.messageID);
    if (this.thread.answerAmount == 0) {
      console.log('answer amount = ', this.thread.answerAmount)
      this.deleteThread();
    } else {
      this.reduceAnswersInThread();
      if (this.thread.firstMessageID == this.message.messageID) {
        this.deleteFirstMessageInThread();
      }
    }
  }

  reduceAnswersInThread() {
    let thread = new Thread(this.thread)
    thread.answerAmount--;
    this.Data.saveThread(thread.toJSON());
    this.Data.currentThread$.next(thread)
  }

  deleteFirstMessageInThread() {
    let thread = new Thread(this.thread)
    thread.firstMessageID = 'deleted';
    this.Data.saveThread(thread.toJSON());
    this.Data.currentThread$.next(thread)
  }

  deleteThread() {
    this.Data.deleteThread(this.thread.threadID);
  }
}
