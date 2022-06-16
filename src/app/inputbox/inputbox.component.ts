import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {

  private newMessage = new Message();
  private newThread = new Thread();

  private currentChannel: Channel;
  private currentThread: Thread;
  public userInput: string = ''; // ngModel Input
  private currentTime = new Date().getTime();
  @Input('currentMessageId') currentMessageId!: string;

  constructor(private Data: DataService) {
    this.Data.currentThread$.subscribe(thread => this.currentThread = thread)
  }

  ngOnInit(): void {}

  async saveUserInput() {
    if (this.userInput.length > 0) {
      if(this.currentMessageId){
        this.saveEditedMessage();
      }else {
        this.addNewMessage()
      }
    } else {
      alert('no input');
    }
  }
  // TODO --> user and image saving to storage

  addNewMessage(){
    if(this.currentThread){
      console.log('current thread =', this.currentThread)
      this.addMessage(this.currentThread.threadID);
    } else{
      console.log('no current thread')
      this.addMessageAndThread();
    }
  }

  async addMessageAndThread(){
    const uniqueThreadID = await this.createNewThread();
    const firstMessageId = await this.addMessage(uniqueThreadID);
    console.log(firstMessageId)
    this.setFirstMessageInThread(uniqueThreadID, firstMessageId);
  }


  async createNewThread() {
    this.currentChannel = await this.Data.currentChannel$.getValue();
    let uniqueThreadID = this.currentChannel.channelID + this.currentTime;
    console.log(uniqueThreadID)
    
    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.channelID;
    this.Data.saveThread(this.newThread.toJSON());
    
    return uniqueThreadID;
  }


  async addMessage(threadID: string, image?: string){
    this.newMessage.threadID = threadID;
    // this.newMessage.authorID = this.Data.currentUser.userID;  // need to be set when authenitcation is creatd
    // this.message.images = image;
    this.newMessage.timestamp = this.currentTime;
    this.newMessage.messageText = this.userInput;
    const firstMessageId = await this.Data.addMessage(this.newMessage.toJSON());
    this.clearInputfield();
    return firstMessageId as string;
    // setFirstMessageId in thread
  }

  setFirstMessageInThread(uniqueThreadID: string, firstMessageId: string){
    this.newThread.firstMessage = firstMessageId;
    this.Data.saveThread(this.newThread.toJSON());
    // will set the first message ID in the new added thread
  }

  saveEditedMessage(image?: string){}



  clearInputfield(){
    this.userInput = '';
  }


  //  WYSWYG TextEditor
  makeBold() {
    document.execCommand('bold');
  }

  makeItalic() {
    document.execCommand('italic');
  }

  toCodeFormat() {
    document.execCommand('italic');
  }
}
