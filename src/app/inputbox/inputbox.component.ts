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

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {
  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;
  @Input('editMessage') editMessage: Message = null; // transferred from app-message
  @Output() setEditmode = new EventEmitter<string>(); // if finished editing to close inputbox

  private message = new Message();
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

  ngOnInit(): void {
    if (this.editMessage) {
      this.handleEditMessage();
    }
  }

  getCurrentThread() {
    this.Data.currentThread$.subscribe(
      (thread) => (this.currentThread = new Thread(thread))
    );
  }

  getCurrentChannel() {
    this.currentChannel = this.Data.currentChannel$.getValue(); // consider relocating to onInit() ??
  }

  handleEditMessage() {
    this.message = new Message(this.editMessage);
    this.userInput = this.message.messageText;
    console.log('handleEditMessage:', this.editMessage);
  }

  handleSendingMessage(): void {
    this.getCurrentChannel();
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
      this.addMessageToThread(this.currentThread.threadID);
      this.updateAnswerAmountInThread();
    } else {
      this.addMessageAndThread();
    }
  }

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

  async saveEditedMessage() {
    this.message.messageText = this.userInput;
    await this.Data.updateMessage(this.message.toJSON());
    this.clearData();
  }

  async addMessageToThread(threadID: string) {
    const currentTime = new Date().getTime();
    let uniqueMessageID = this.getUniqueID(currentTime);
    this.message.threadID = threadID;
    this.message.channelID = this.currentChannel.id;
    this.message.messageID = uniqueMessageID;
    this.message.authorID = this.Auth.currentUserId;
    this.message.timestamp = currentTime;
    this.addImagesToMessage();
    this.message.messageText = this.userInput;
    console.log('addMessageToThread, message ready to save:', this.message);

    await this.Data.saveMessage(this.message.toJSON());
    this.clearData();
  }

  addImagesToMessage() {
    // transfer temporary saved downloadURL to messageFiles
    this.message.images = [];
    this.messageFiles.forEach((file) => {
      this.message.images.push(file.downloadURL);
    });
  }

  getUniqueID(currentTime: number) {
    return (
      this.currentChannel.id +
      currentTime +
      '-' +
      Math.round(Math.random() * 10000).toString()
    );
  }

  setFirstMessageInThread() {
    this.newThread.firstMessageID = this.message.messageID;
    this.Data.saveThread(this.newThread.toJSON());
  }

  clearData() {
    this.setEditmode.emit('false'); // triggers closing inputbox if it was open in editmode
    this.editMessage = null;
    this.userInput = '';
    this.messageFiles = [];
    this.message.images = [];
  }

  updateAnswerAmountInThread() {
    this.currentThread.answerAmount++;
    this.Data.saveThread(this.currentThread.toJSON());
    this.Data.currentThread$.next(this.currentThread);
  }

  setLoadingStatus(status: string, file: File) {
    const fileIndex = this.messageFiles.indexOf(file);
    const currentfile = this.messageFiles[fileIndex];
    currentfile.isLoading = status;
  }
}
