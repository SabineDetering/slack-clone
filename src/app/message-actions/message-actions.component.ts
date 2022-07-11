import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { EditorService } from 'src/services/editor.service';
import { LocalStorageService } from 'src/services/local-storage.service';
import { ThreadService } from 'src/services/thread.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  @Input() thread!: Thread;
  @Input() message!: Message;
  @Input() actionsType!: string;
  message$: Observable<Message>;

  constructor(
    public router: Router,
    private Data: DataService,
    private editor: EditorService,
    private Auth: AuthService,
    private storage: LocalStorageService,
    private ts: ThreadService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (!this.message) {
      this.message$ = this.Data.getMessageFromMessageId(
        this.thread.firstMessageID
      );
      this.message$.subscribe((message) => (this.message = message));
    }
  }

  answerInThread() {
    if (this.Data.messagesSubscription) this.ts.deleteMessagesSubscription();
    if (this.Data.currentMessages.length > 0) this.Data.currentMessages$.next([])
    this.Data.currentThread$.next(this.thread);
    this.Data.getMessagesFromThreadID(this.thread.threadID);
    this.storage.setUserSessionInLocalStorage(
      this.Auth.currentUserId,
      this.Data.currentChannel.id,
      this.Data.currentChannel.type,
      this.thread.threadID
    );
  }

  openDeleteConfirmation() {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Delete Message',
        text: "Deleting your message can't be undone.",
        question: "Do you really want to proceed?",
        discardText: 'No',
        confirmText: 'Yes',
      },
    });
    confirmationRef.afterClosed().subscribe((result) => {
      if (result == 'confirm') {
        this.deleteMessage();
      }
    });
  }


  async deleteMessage() {
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

  userHasEditRights() {
    return this.Auth?.currentUserId == this.message?.authorID;
  };

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
    this.ts.closeCurrentThread(true, this.Auth.currentUserId)
    this.Data.deleteThread(this.thread.threadID);
  }

  setEditmode() {
    this.editor.messageToEdit = this.message;
  }

  deletedFirstMessage() {
    return !(
      this.thread.firstMessageID == 'deleted' &&
      this.actionsType == 'threadActions'
    );
  }
}
