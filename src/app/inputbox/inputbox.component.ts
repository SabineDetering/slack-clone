import { Component, Input, OnInit } from '@angular/core';
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

  private message = new Message();
  private newThread = new Thread();
  private currentChannel: Channel;
  


  constructor(private Data: DataService) {

    console.log('currChannel',this.currentChannel);
  }

  ngOnInit(): void {}

  async saveUserInput(typeOfMessage: string, inputText: string) {  // type can be "channel" or "directChannel" (=directMessage)
    if (inputText.length > 0) {
     await this.createNewThread(typeOfMessage, inputText);
      // this.saveMessage(inputText);
     
      // create a new Thread to Database
      // this.newThread.type = typeOfMessage;
      // this.newThread.channelID = this.currentChannel.channelID;
      // this.message.messageText = inputText;
      // this.message.timestamp = new Date().getTime();
      // this.Data.saveMessage(this.message);
    } else {
      alert('no input');
    }
  }

  async createNewThread(typeOfMessage: string, inputText: string) {
    this.currentChannel = await this.Data.currentChannel$.getValue();
    this.newThread.type = typeOfMessage;
    this.newThread.channelID = this.currentChannel.channelID;
    this.newThread.firstMessage = inputText;
    this.Data.saveThread(this.newThread.toJSON());
  }

  // TODO --> user and image saving to storage
  saveMessage(inputText: string, image?: string) {
    // this.message.threadID = this.newThread.threadID;
    // this.message.authorID = this.Data.currentUser.userID;  // need to be set when authenitcation is creatd
    this.message.timestamp = new Date().getTime();
    this.message.messageText = inputText;
    // this.message.images = image;
    this.Data.saveMessage(this.message);
  }

  makeBold(){
    document.execCommand('bold');
  }

  makeItalic(){
    document.execCommand('italic');
  }

  toCodeFormat(){
    document.execCommand('italic');
  }
}
