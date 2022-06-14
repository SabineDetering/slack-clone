import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
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
  public userInput: string = ''; // ngModel Input
  private currentTime = new Date().getTime();
  @Input('currentMessageId') currentMessageId!: string;

  constructor(private Data: DataService) {}

  ngOnInit(): void {}

  async saveUserInput() {
    if (this.userInput.length > 0) {
      if(this.currentMessageId){
        this.saveEditedMessage();
      }else {
        this.addMessageAndThread()
      }
    } else {
      alert('no input');
    }
  }
  // TODO --> user and image saving to storage


  async addMessageAndThread(){
    const uniqueThreadID = await this.createNewThread();
    const firstMessageId = await this.addMessage();
    console.log(firstMessageId)
    this.setFirstMessageInThread(uniqueThreadID, firstMessageId);
    this.clearInputfield();
  }


  async createNewThread() {
    this.currentChannel = await this.Data.currentChannel$.getValue();
    let uniqueThreadID = this.currentChannel.channelID + this.currentTime;
    
    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.channelID;
    this.Data.saveThread(this.newThread.toJSON());
    
    return uniqueThreadID;
  }


  async addMessage(image?: string){
    this.newMessage.threadID = this.newThread.threadID;
    // this.newMessage.authorID = this.Data.currentUser.userID;  // need to be set when authenitcation is creatd
    // this.message.images = image;
    this.newMessage.timestamp = this.currentTime;
    this.newMessage.messageText = this.userInput;
    const firstMessageId = await this.Data.addMessage(this.newMessage.toJSON());
    return firstMessageId;
    // setFirstMessageId in thread
  }

  setFirstMessageInThread(uniqueThreadID: string, firstMessageId: DocumentReference<Message>){
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
