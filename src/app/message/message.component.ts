import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';
import { EditorService } from 'src/services/editor.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  @Input() thread!: Thread;

  date: Date | undefined;
  messageAuthorName: string;
  messageAuthorAvatar: string;
  fullsizeOpen: boolean = false;

  public isDeleted: boolean = false;
  public inEditmode: boolean = false;
  public userInput: any = ''; // ngModel Input

  constructor(public Data: DataService, public editor: EditorService) {}

  ngOnInit(): void {
    if (this.isAnswerMessage()) {
      this.setAnswerMessage();
    } else if (this.isFirstThreadMessage()) {
      this.setFirstThreadMessage();
    } else {
      this.setDeletedMessage();
    }
  }

  setEditmode(isEditing: string) {
    if (isEditing == 'true' && !this.isDeleted) {
      this.inEditmode = true;
    } else {
      this.inEditmode = false;
    }
  }

  isAnswerMessage() {
    return this.message;
  }

  isFirstThreadMessage() {
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

  async setFirstThreadMessage() {
    this.message = await this.Data.getMessageFromMessageId(
      this.thread.firstMessageID
    );
    this.getMessageTime();
    this.getMessageAuthorName();
    this.getAuthorAvatar();
  }

  setDeletedMessage() {
    this.message = new Message(); // generating empty message for displaying mainContainer although message deleted
    this.message.messageText = 'This message has been deleted';
    this.messageAuthorName = 'unknown author';
    this.isDeleted = true;  // disables Editing this messge
    this.getAuthorAvatar('isDeleted');
  }

  getMessageTime() {
    this.date = new Date(this.message.timestamp);
  }

  // always get up to date Displayname from authors ID
  getMessageAuthorName() {
    if (this.message) {
      this.Data.getUserdataFromUserID(this.message.authorID).then((user) => {
        this.messageAuthorName = user.displayName;
      });
    }
  }

  getAuthorAvatar(messageIsDeleted?: string) {
    if (messageIsDeleted == 'isDeleted') {
      this.messageAuthorAvatar = 'assets/img/avatar-deletedMessage.png';
      return;
    } else {
      this.Data.getUserdataFromUserID(this.message.authorID).then((user) => {
        this.messageAuthorAvatar =
          user.photoURL || 'assets/img/avatar-neutral.png'; // neutral Avatar is used for guests --> no photoURL
      });
    }
  }
}
