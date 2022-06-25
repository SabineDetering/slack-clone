import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { EditorService } from 'src/services/editor.service';
import { Editor } from 'tinymce';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {
  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;

  private newMessage = new Message();
  private newThread = new Thread();

  public currentChannel!: CurrentChannel;
  private currentThread!: Thread;
  public userInput: any = ''; // ngModel Input

  public messageFiles: any[] = []; // datatype: object

  constructor(
    private Data: DataService,
    public Auth: AuthService,
    private storage: AngularFireStorage,
    public editor: EditorService
  ) {
    this.getCurrentThread();
  }

  ngOnInit(): void {}

  logUserInput() {
    console.log(this.userInput);
  }

  getCurrentThread() {
    this.Data.currentThread$.subscribe(
      (thread) => (this.currentThread = new Thread(thread))
    );
  }

  handleUserInput(): void {
    if (this.messageFiles.length > 0) {
      this.postMessageWithFile();
    } else {
      this.postMessage();
    }
  }

  postMessage(): void {
    this.currentChannel = this.Data.currentChannel$.getValue();
    if (this.userInput.length > 0 || this.messageFiles.length > 0) {
      if (this.currentMessageId) {
        this.saveEditedMessage();
      } else {
        this.addNewMessage();
      }
    } else {
      alert('no text input');
    }
  }

  // save files in local ARRAY and Trigger Upload to Storage
  async getUploadFile(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      console.log('getUploadFile', event.target.files[i]);
      const newFile = event.target.files[i];
      if (!this.filenameAlreadyChoosen(newFile)) {
        this.messageFiles.push(newFile);
        await this.saveFileToStorage(newFile);
      } else {
        alert('file is already chosen');
      }
    }
  }

  filenameAlreadyChoosen(newFile: File) {
    return this.messageFiles.some((file) => file.name === newFile.name);
  }

  deleteFile(i: number) {
    let currFile = this.messageFiles[i];
    if (currFile.downloadURL) {
      this.storage.storage.refFromURL(currFile.downloadUrl).delete();
    }
    this.messageFiles.splice(i, 1);
  }

  // upload files to Firebase STORAGE
  async saveFileToStorage(file: File) {
    const filePathInStorage =
      'chatimages/' + (this.Auth.currentUserId + '_' + file.name);
    const storageRef = this.storage.ref(filePathInStorage);
    const uploadTask = this.storage.upload(filePathInStorage, file);

   uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          let fileDownloadURL = await firstValueFrom(
            storageRef.getDownloadURL()
          );
          let fileIndex = this.messageFiles.indexOf(file);
          console.log('fileIndex', fileIndex);

          this.messageFiles[fileIndex].downloadURL = fileDownloadURL;
        })
      )
      .subscribe((data) => {
        console.log('data from subscribe', data.state);
        if (data.state == 'success') {
          console.log('upload finished');
        }
      });
  }

  // post all data, including files to Database --> enable button only if all data is uploaded54
  postMessageWithFile(): any {
    this.messageFiles.map((file) => {
      const filePathInStorage =
        'chatimages/' + (this.Auth.currentUserId + '_' + file.name);
      const storageRef = this.storage.ref(filePathInStorage);
      const uploadTask = this.storage.upload(filePathInStorage, file);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            let fileDownloadURL = await firstValueFrom(
              storageRef.getDownloadURL()
            );
            this.newMessage.images.push(fileDownloadURL);
            if (this.messageFiles.length == this.newMessage.images.length) {
              this.postMessage();
            } else {
              console.log('FileUpload still in progress ...');
              console.log(
                'files.length',
                this.messageFiles.length,
                'images.length',
                this.newMessage.images.length
              );
            }
          })
        )
        .subscribe(); // is needed to trigger observable emitting
    });
    // return uploadTask.percentageChanges();
  }

  addNewMessage() {
    if (this.messageType == 'answerMessage') {
      this.addMessageToThread(this.currentThread.threadID);
      this.updateAnswerAmountInThread();
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
    let uniqueThreadID = this.getUniqueID(currentTime);

    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.id;
    await this.Data.saveThread(this.newThread.toJSON());
    return uniqueThreadID;
  }

  async addMessageToThread(threadID: string) {
    const currentTime = new Date().getTime();
    let uniqueMessageID = this.getUniqueID(currentTime);

    this.newMessage.threadID = threadID;
    this.newMessage.messageID = uniqueMessageID;
    this.newMessage.authorID = this.Auth.currentUserId;
    this.newMessage.timestamp = currentTime;
    this.newMessage.messageText = this.userInput;

    await this.Data.saveMessage(this.newMessage.toJSON());
    this.clearUserInput();
  }

  getUniqueID(currentTime: number) {
    return (
      this.currentChannel.id +
      currentTime +
      '-' +
      Math.round(Math.random() * 10000).toString()
    );
  }

  updateAnswerAmountInThread() {
    this.currentThread.answerAmount++;
    this.Data.saveThread(this.currentThread.toJSON());
    this.Data.currentThread$.next(this.currentThread);
  }

  setFirstMessageInThread() {
    this.newThread.firstMessageID = this.newMessage.messageID;
    this.Data.saveThread(this.newThread.toJSON());
  }

  clearUserInput() {
    this.userInput = '';
    this.messageFiles = [];
  }
}
