import { Component, OnInit } from '@angular/core';
import { Message } from 'src/models/message.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {

  private message = new Message();

  constructor(private data: DataService) {}

  ngOnInit(): void {}

  saveNewThreadMsg(inputText: string) {
    if (inputText.length > 0) {
      this.message.messageText = inputText;
      this.message.timestamp = new Date().getTime();
      this.data.saveMessage(this.message);
    } else {
      alert('no input');
    }
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
