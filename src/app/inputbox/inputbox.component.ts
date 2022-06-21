import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {
  private newMessage = new Message();
  private newThread = new Thread();

  public currentChannel!: CurrentChannel;
  private currentThread!: Thread;
  public userInput: string = ''; // ngModel Input

  private selectedText: string = '';
  private selectionStart!: number;
  private selectionEnd!: number;

  public file: File = null;
  public uploadProgress: number = 0;

  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('placeholder') placeholder: ElementRef;

  constructor(
    private Data: DataService,
    public Auth: AuthService,
    private storage: AngularFireStorage
  ) {
    this.Data.currentThread$.subscribe(
      (thread) => (this.currentThread = thread)
    );
  }

  ngOnInit(): void {}

  handleUserInput() {
    if (this.file) {
      this.postMessageWithFile().subscribe((progress) => {
        this.uploadProgress = progress;
      });
    } else {
      this.postTextMessage();
    }
  }

  postTextMessage() {
    this.userInput = this.textarea.nativeElement.innerText;
    this.currentChannel = this.Data.currentChannel$.getValue();
    if (this.userInput.length > 0) {
      if (this.currentMessageId) {
        this.saveEditedMessage();
      } else {
        this.addNewMessage();
      }
    } else {
      alert('no text input');
    }
  }

  getUploadFile(event: any) {
    this.file = event.target.files[0]; // user selected from PC
  }

  postMessageWithFile(): Observable<number> {
    const filePathInStorage = 'chatimages/' + (this.Auth.currentUserId + '_' + this.file.name);
    const storageRef = this.storage.ref(filePathInStorage);
    const uploadTask = this.storage.upload(filePathInStorage, this.file);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          let fileDownloadURL = await firstValueFrom(
            storageRef.getDownloadURL()
          );
          this.newMessage.images.push(fileDownloadURL);
          this.postTextMessage();
        })
      )
      .subscribe();
    return uploadTask.percentageChanges(); 
  }

  addNewMessage() {
    if (this.messageType == 'answerMessage') {
      this.addMessageToThread(this.currentThread.threadID);
    } else {
      this.addMessageAndThread();
    }
  }

  // TODO
  saveEditedMessage(image?: string) {}

  async addMessageAndThread() {
    const uniqueThreadID = await this.createNewThread();
    await this.addMessageToThread(uniqueThreadID);
    this.setFirstMessageInThread();
  }

  async createNewThread() {
    const currentTime = new Date().getTime();
    let uniqueThreadID =
      this.currentChannel.id +
      currentTime +
      Math.round(Math.random() * 10000).toString();

    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.id;
    await this.Data.saveDocWithCustomID(
      'threads',
      this.newThread.toJSON(),
      uniqueThreadID
    );

    return uniqueThreadID;
  }

  async addMessageToThread(threadID: string) {
    const currentTime = new Date().getTime();
    let uniqueMessageID =
      this.currentChannel.id +
      '-' +
      currentTime +
      Math.round(Math.random() * 10000).toString();

    this.newMessage.threadID = threadID;
    this.newMessage.messageID = uniqueMessageID;
    this.newMessage.authorID = this.Auth.currentUserId;
    this.newMessage.timestamp = currentTime;
    this.newMessage.messageText = this.userInput;

    await this.Data.saveDocWithCustomID(
      'messages',
      this.newMessage.toJSON(),
      uniqueMessageID
    );
    this.clearUserInput();
  }

  setFirstMessageInThread() {
    this.newThread.firstMessageID = this.newMessage.messageID;
    this.Data.saveDocWithCustomID(
      'threads',
      this.newThread.toJSON(),
      this.newThread.threadID
    );
  }

  clearUserInput() {
    this.textarea.nativeElement.innerHTML = '';
    this.file = null;
  }

  // TODO:  WYSWYG TextEditor
  makeBold() {
    let text = this.textarea.nativeElement.innerHTML;
    console.log(text);
    this.selectedText = this.textarea.nativeElement.innerHTML.substring(
      this.selectionStart,
      this.selectionEnd
    );
    console.log(this.selectedText);
    const textBeforeSelection = this.textarea.nativeElement.innerHTML.substring(
      0,
      this.selectionStart
    );
    console.log(textBeforeSelection);
    const textAfterSelection = this.textarea.nativeElement.innerHTML.substring(
      this.selectionEnd,
      text.length - 1
    );
    console.log(textAfterSelection);
    const replacement = this.selectedText.replace(
      this.selectedText,
      '<strong>' + this.selectedText + '</strong>'
    );
    const newText = textBeforeSelection + replacement + textAfterSelection;
    console.log(newText);
    this.textarea.nativeElement.innerHTML = newText;
    /* document.execCommand('bold'); */
  }

  makeItalic() {
    document.execCommand('italic');
  }

  toCodeFormat() {
    document.execCommand('italic');
  }

  getSelectedText() {
    const selection = document.getSelection();
    this.selectionStart = selection.anchorOffset;
    this.selectionEnd = selection.focusOffset;
    console.log(
      this.textarea.nativeElement.innerHTML.substring(
        this.selectionStart,
        this.selectionEnd
      )
    );
  }

  removePlaceholder() {
    this.textarea.nativeElement.innerHTML = '';
  }
}
