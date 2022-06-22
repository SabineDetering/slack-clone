import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
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
  public userInput!: any; // ngModel Input

  public files: File[] = [];
  public uploadProgress: number = 0;

  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;

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

  logUserInput() {
    console.log(this.userInput);
  }

  handleUserInput() {
    console.log('handle userInput');
    if (this.files.length > 0) {
      this.postMessageWithFile()
      // .subscribe((progress) => {
      //   console.log('progress after all:', progress);
      // });
    } else {
      this.postMessage();
    }
  }

  postMessage() {
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
    this.files = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      this.files.push(file);
    }
    console.log('uploaded files:', this.files);
  }

  postMessageWithFile(): any {
    console.log('array müsste leer sein:', this.files, this.newMessage.images);
    
    // console.log('111 postMessageWithFile()', uploadTask);
    let task = this.files.map((file) => {
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
            if (this.files.length == this.newMessage.images.length) {
        
              
              this.postMessage();
            } else {
              console.log('noch nicht fertig');
            }
          })
        )
        .subscribe();
        // return uploadTask.percentageChanges();
    });

    // return uploadTask.percentageChanges();
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
    /* this.newMessage.messageText = this.userInput; */

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
    this.userInput = '';
    this.files = [];
  }
}
