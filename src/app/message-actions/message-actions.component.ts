import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { EditorService } from 'src/services/editor.service';
import { LocalStorageService } from 'src/services/local-storage.service';
import { ThreadService } from 'src/services/thread.service';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  /* @Input() currentChannel!: CurrentChannel; */
  @Input() thread!: Thread;
  @Input() message!: Message;
  @Input() actionsType!: string;
  message$: Observable<Message>;
  // currentChannel!: Channel;
  /*   currentChannel: CurrentChannel;
   */
  constructor(
    public router: Router,
    private Data: DataService,
    private editor: EditorService,
    private Auth: AuthService,
    private storage: LocalStorageService,
    private ts: ThreadService
  ) {}

   ngOnInit(): void {
    if (!this.message) {
      this.message$ = this.Data.getMessageFromMessageId(
        this.thread.firstMessageID
      );
      this.message$.subscribe(message => this.message = message)
    }
  }

  answerInThread() {
    this.Data.currentThread$.next(this.thread);
    this.storage.setUserSessionInLocalStorage(this.Auth.currentUserId, this.Data.currentChannel.id, this.Data.currentChannel.type,  this.thread.threadID);
    this.Data.getMessagesFromThreadID(this.thread.threadID);
  }

  async deleteMessage() {
    console.log(this.thread);
    this.Data.deleteMessage(this.message.messageID);
    if (this.isLastMessageInThread()) {
      this.deleteThread();
    } else {
      await this.ts.updateAnswerAmountInThread();
      if (this.thread.firstMessageID == this.message.messageID) {
        this.deleteFirstMessageInThread();
      }
    }
  }

  isLastMessageInThread() {
    return (
      this.thread.answerAmount == 0 ||
      (this.thread.answerAmount == 1 && this.thread.firstMessageID == 'deleted')
    );
  }

  deleteFirstMessageInThread() {
    let thread = new Thread(this.thread);
    thread.firstMessageID = 'deleted';
    this.Data.saveThread(thread.toJSON());
    this.Data.currentThread$.next(thread);
  }

  deleteThread() {
    this.Data.deleteThread(this.thread.threadID);
  }

  setEditmode() {
    this.editor.messageToEdit = this.message;
  }
}
