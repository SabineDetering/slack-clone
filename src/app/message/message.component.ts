import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { User } from 'src/models/user.class';
import { DataService } from 'src/services/data.service';
import { EditorService } from 'src/services/editor.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() message!: Message; // gets Input message variable only in ThreadContainer
  @Input() thread!: Thread;
  @Input() firstAnswerMessage: Boolean = false;
  @Input() parentContainer!: string;
  message$!: Observable<Message>;
  messageSubscription!: Subscription;
  user$!: Observable<User>;
  user!: User;
  userSubscription!: Subscription;

  date: Date | undefined;
  messageAuthorName: string;
  messageAuthorAvatar: string;
  fullsizeOpen: boolean = false;

  public isDeleted: boolean = false;
  public userInput: any = ''; // ngModel Input

  constructor(public Data: DataService, public editor: EditorService) {}

  ngOnInit(): void {
    if (this.isMessageInThreadContainer()) {
      this.getMessageProperties();
    } else if (this.isFirstThreadMessageInMain()) {
      this.setFirstThreadMessage();
    } else {
      this.setDeletedMessage();
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  isMessageInThreadContainer() {
    return this.message;
  }

  isFirstThreadMessageInMain() {
    return (
      this.thread.firstMessageID != '' &&
      this.thread.firstMessageID != 'deleted'
    );
  }

  setAnswerMessage() {
    this.getMessageTime();
    this.getMessageAuthorName();
    this.getAuthorAvatar();
  }

  setFirstThreadMessage() {
    this.message$ = this.Data.getMessageFromMessageId(
      this.thread.firstMessageID
    );
    this.messageSubscription = this.message$.subscribe((message) => {
      this.message = message;
      this.getMessageProperties();
    });
  }

  getMessageProperties() {
    if(this.message){
      this.user$ = this.Data.getUserdataFromUserID(this.message.authorID);
      this.userSubscription = this.user$.subscribe((user) => {
        this.user = user;
        this.getMessageAuthorName();
        this.getAuthorAvatar();
      });
      this.getMessageTime();
    }
  }

  setDeletedMessage() {
    this.message = new Message(); // generating empty message for displaying mainContainer although message deleted
    this.message.messageText = 'This message has been deleted';
    this.messageAuthorName = 'unknown author';
    this.isDeleted = true; // disables Editing this messge
    this.getAuthorAvatar('isDeleted');
  }

  getMessageTime() {
    this.date = new Date(this.message.timestamp);
  }

  // always get up to date Displayname from authors ID
  getMessageAuthorName() {
    if (this.message) {
      if (this.user) this.messageAuthorName = this.user.displayName;
      else this.messageAuthorName = 'user deleted';
    }
  }

  getAuthorAvatar(messageIsDeleted?: string) {
    if (messageIsDeleted == 'isDeleted') {
      this.messageAuthorAvatar = 'assets/img/avatar-deletedMessage.png';
      return;
    } else {
      if (this.user){
        this.messageAuthorAvatar =
          this.user.photoURL || 'assets/img/avatar-neutral-grey.png';
        if(this.messageAuthorAvatar == 'assets/img/avatar-neutral-light-grey.png') this.messageAuthorAvatar = 'assets/img/avatar-neutral-grey.png'
        }
      // neutral Avatar is used for guests --> no photoURL
      else this.messageAuthorAvatar = 'assets/img/avatar-unknown.png';
    }
  }
}
