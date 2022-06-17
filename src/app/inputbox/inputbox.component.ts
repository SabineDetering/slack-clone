import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;

  constructor(private Data: DataService) {
    this.Data.currentThread$.subscribe(thread => this.currentThread = thread)
  }

  ngOnInit(): void {}

  async saveUserInput() {
    this.currentChannel = await this.Data.currentChannel$.getValue();

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
    console.log(this.messageType)
    if(this.messageType == 'answerMessage'){
      this.addMessage(this.currentThread.threadID);
    } else{
      this.addMessageAndThread();
    }
  }

  async addMessageAndThread(){
    const uniqueThreadID = await this.createNewThread();
    await this.addMessage(uniqueThreadID);
    this.setFirstMessageInThread();
  }


  async createNewThread() {
    const currentTime = new Date().getTime();
    let uniqueThreadID = this.currentChannel.channelID + currentTime + Math.round((Math.random() * 10000)).toString();
    
    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.channelID;
    await this.Data.saveDocWithCustomID('threads', this.newThread.toJSON(), uniqueThreadID);

    return uniqueThreadID;
  }


  async addMessage(threadID: string, image?: string){
    const currentTime = new Date().getTime();
    let uniqueMessageID = this.currentChannel.channelID + '-' + currentTime + Math.round((Math.random() * 10000)).toString();

    this.newMessage.threadID = threadID;
    this.newMessage.messageID = uniqueMessageID;
    // this.newMessage.authorID = this.Data.currentUser.userID;  // need to be set when authenitcation is creatd
    // this.message.images = image;
    this.newMessage.timestamp = currentTime;
    this.newMessage.messageText = this.userInput;
    await this.Data.saveDocWithCustomID('messages', this.newMessage.toJSON(), uniqueMessageID);
    this.clearInputfield();
  }

  setFirstMessageInThread(){
    this.newThread.firstMessageID = this.newMessage.messageID;
    this.Data.saveDocWithCustomID('threads', this.newThread.toJSON(), this.newThread.threadID);
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
