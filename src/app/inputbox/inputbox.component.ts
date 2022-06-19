import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

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
  @Input('currentMessageId') currentMessageId!: string;
  @Input('messageType') messageType!: string;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('placeholder') placeholder: ElementRef;

  constructor(
    private Data: DataService, 
    public Auth: AuthService) {
    this.Data.currentThread$.subscribe(thread => this.currentThread = thread);
  }

  ngOnInit(): void {}

  async saveUserInput() {
    this.userInput = this.textarea.nativeElement.innerText
    this.currentChannel = await this.Data.currentChannel$.getValue();

    if (this.userInput.length > 0) {
      if(this.currentMessageId){
        this.saveEditedMessage();
      } else {
        this.addNewMessage();
      }
    } else {
      alert('no input');
    }
  }


  addNewMessage(){
    if(this.messageType == 'answerMessage'){ 
      this.addMessageToThread(this.currentThread.threadID);
    } else{
      this.addMessageAndThread();
    }
  }

  async addMessageAndThread(){
    const uniqueThreadID = await this.createNewThread();
    await this.addMessageToThread(uniqueThreadID);
    this.setFirstMessageInThread();
  }


  async createNewThread() {
    const currentTime = new Date().getTime();
    let uniqueThreadID = this.currentChannel.id + currentTime + Math.round((Math.random() * 10000)).toString();
    
    this.newThread.threadID = uniqueThreadID; // set custom ThreadID to use it for this thread and saveMessage()
    this.newThread.channelID = this.currentChannel.id;
    await this.Data.saveDocWithCustomID('threads', this.newThread.toJSON(), uniqueThreadID);

    return uniqueThreadID;
  }


  async addMessageToThread(threadID: string, image?: string){
    const currentTime = new Date().getTime();
    let uniqueMessageID = this.currentChannel.id + '-' + currentTime + Math.round((Math.random() * 10000)).toString();

    this.newMessage.threadID = threadID;
    this.newMessage.messageID = uniqueMessageID;
    this.newMessage.authorID = this.Auth.currentUserId;
    console.log('currUserId',this.newMessage.authorID);
    
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
    this.textarea.nativeElement.innerHTML = '';
  }


  // TODO:  WYSWYG TextEditor
  makeBold() {
    let text = this.textarea.nativeElement.innerHTML
    console.log(text)
    this.selectedText = this.textarea.nativeElement.innerHTML.substring(this.selectionStart, this.selectionEnd)
    console.log(this.selectedText)
    const textBeforeSelection = this.textarea.nativeElement.innerHTML.substring(0, this.selectionStart)
    console.log(textBeforeSelection)
    const textAfterSelection = this.textarea.nativeElement.innerHTML.substring(this.selectionEnd, text.length-1)
    console.log(textAfterSelection)
    const replacement = this.selectedText.replace(this.selectedText, '<strong>' + this.selectedText + '</strong>')
    const newText = textBeforeSelection + replacement + textAfterSelection
    console.log(newText)
    this.textarea.nativeElement.innerHTML = newText;
    /* document.execCommand('bold'); */
  }

  makeItalic() {
    document.execCommand('italic');
  }

  toCodeFormat() {
    document.execCommand('italic');
  }
  
  getSelectedText(){
    const selection = document.getSelection();  
    this.selectionStart = selection.anchorOffset;
    this.selectionEnd = selection.focusOffset;
    console.log(this.textarea.nativeElement.innerHTML.substring(this.selectionStart, this.selectionEnd))

  }


  removePlaceholder(){
    this.textarea.nativeElement.innerHTML = '';
  }

}
