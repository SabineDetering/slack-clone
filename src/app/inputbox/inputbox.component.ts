import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { ThreadService } from 'src/services/thread.service';
import { ChannelService } from 'src/services/channel.service';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {
  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;
  @Input('editMessage') editMessage: Message = null; // transferred from app-message

  @Output() messageSending: EventEmitter<any> = new EventEmitter();

  private message = new Message();
  private newThread = new Thread();

  /* public currentChannel!: CurrentChannel; */
  /* private currentThread!: Thread; */
  public userInput: any = ''; // ngModel Input

  public messageFiles: any[] = []; // datatype: object

  constructor(
    private Data: DataService,
    public Auth: AuthService,
    private storage: AngularFireStorage,
    public editor: EditorService,
    private ts: ThreadService, 
    private cs: ChannelService
  ) {}

  ngOnInit(): void {
    if (this.editMessage) {
      this.handleEditMessage();
    }
  }

  handleEditMessage() {
    this.message = new Message(this.editMessage);
    this.userInput = this.message.messageText;
    /* console.log('handleEditMessage:', this.editMessage); */
  }

  handleSendingMessage(): void {
    /* console.log('handleSendingMessage:', this.message); */

    /* this.getCurrentChannel(); */
    if (this.userInput.length > 0 || this.messageFiles.length > 0) {
      if (this.editMessage) {
        console.log('add EDITED message', this.editMessage);
        this.saveEditedMessage();
      } else {
        console.log('add NEW message');
        this.addNewMessage();
      }
    } else {
      alert('no text input');
    }
  }

  // save files in local ARRAY and Trigger Upload to Storage
  // no need for if "filename is already choosen before" --> becaucse ...
  // ... by default (of inputfield typ file?), its not possible to upload same filename twice!
  async getUploadFile(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      const newFile = event.target.files[i];
      this.messageFiles.push(newFile); // array to display in frontend
      await this.saveFileToStorage(newFile);
    }
  }

  filenameAlreadyChoosen(newFile: File) {
    return this.messageFiles?.some((file) => file.name === newFile.name);
  }

  deleteFile(i: number) {
    let currFile = this.messageFiles[i];
    if (currFile.filePathInStorage) {
      const storageRef = this.storage.ref(currFile.filePathInStorage);
      storageRef.delete();
    }
    this.messageFiles.splice(i, 1);
  }

  // upload each file individually to Firebase STORAGE (not in DB yet!)
  async saveFileToStorage(file: File) {
    this.setLoadingStatus('true', file);

    let filePathInStorage =
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
          // Note: user can still delete file before sending message
          // URL is stored temporarily in each file obj, until commiting to send
          let currentFile = this.getFileFromTempArray(file);
          currentFile.downloadURL = fileDownloadURL;
          currentFile.filePathInStorage = filePathInStorage; // save, if file is deleted
        })
      )
      .subscribe((data) => {
        if (data.state == 'success') {
          this.setLoadingStatus('false', file);
        }
      });
  }

  getFileFromTempArray(file: File) {
    let indexOfFile = this.messageFiles.indexOf(file);
    let fileObject = this.messageFiles[indexOfFile];
    return fileObject;
  }

  addNewMessage() {
    if (this.messageType == 'answerMessage') {
      this.addMessageToThread(this.Data.currentThread.threadID);
      this.ts.updateAnswerAmountInThread(true);
    } else {
      this.addMessageAndThread();
    }
  }

  async addMessageAndThread() {
    await this.createNewThread();
    await this.addMessageToThread(this.newThread.threadID);
    this.setFirstMessageInThread();
  }

  async createNewThread() {
    this.newThread.threadID = this.getUniqueID(new Date().getTime());
    this.newThread.channelID = this.Data.currentChannel.id;
    await this.Data.saveThread(this.newThread.toJSON());
  }

  async saveEditedMessage() {
    this.message.messageText = this.userInput;
    await this.Data.updateMessage(this.message.toJSON());
    this.clearData();
  }

  async addMessageToThread(threadID: string) {
    this.setMessageProperties(threadID);
    await this.Data.saveMessage(this.message.toJSON());
    this.clearData();
    this.cs.scrollMain = true;
  }


  setMessageProperties(threadID: string) {
    const currentTime = new Date().getTime();
    this.message.messageID = this.getUniqueID(currentTime);
    this.message.threadID = threadID;
    this.message.channelID = this.Data.currentChannel.id;
    this.message.authorID = this.Auth.currentUserId;
    this.message.timestamp = currentTime;
    this.message.messageText = this.userInput;
    this.addImagesToMessage();
  }

  addImagesToMessage() {
    // transfer temporary saved downloadURL to messageFiles
    this.message.images = [];
    this.messageFiles.forEach((file) => {
      this.message.images.push(file.downloadURL);
    });
  }

  setFirstMessageInThread() {
    this.newThread.firstMessageID = this.message.messageID;
    this.Data.saveThread(this.newThread.toJSON());
  }

  getUniqueID(currentTime: number) {
    return (
      this.Data.currentChannel.id +
      currentTime +
      '-' +
      Math.round(Math.random() * 10000).toString()
    );
  }

  clearData() {
    this.editor.messageToEdit = null;
    this.editMessage = null;
    this.userInput = '';
    this.messageFiles = [];
    this.message.images = [];
  }

  setLoadingStatus(status: string, file: File) {
    const fileIndex = this.messageFiles.indexOf(file);
    const currentfile = this.messageFiles[fileIndex];
    currentfile.isLoading = status;
  }
}
