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
  public userInput: string = ''; // ngModel Input
  private currentTime = new Date().getTime();

  constructor(private Data: DataService) {}

  ngOnInit(): void {}

  async saveUserInput(typeOfMessage: string) {
    if (this.userInput.length > 0) {
      await this.createNewThread(typeOfMessage);
      this.saveMessage();
      this.clearInputfield();
    } else {
      alert('no input');
    }
  }

  clearInputfield(){
    this.userInput = '';
  }

  async createNewThread(typeOfMessage: string) {
    this.currentChannel = await this.Data.currentChannel$.getValue();
    let uniqueThreadID = this.currentChannel.channelID + this.currentTime;

    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.type = typeOfMessage;
    this.newThread.channelID = this.currentChannel.channelID;
    this.newThread.firstMessage = this.userInput;
    this.Data.saveThread(this.newThread.toJSON());
  }

  // TODO --> user and image saving to storage
  saveMessage(image?: string) {
    this.newMessage.threadID = this.newThread.threadID;
    // this.newMessage.authorID = this.Data.currentUser.userID;  // need to be set when authenitcation is creatd
    // this.message.images = image;
    this.newMessage.timestamp = this.currentTime;
    this.newMessage.messageText = this.userInput;
    this.Data.saveMessage(this.newMessage.toJSON());
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
