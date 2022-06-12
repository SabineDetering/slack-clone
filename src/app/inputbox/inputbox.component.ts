import { Component, OnInit } from '@angular/core';
import { ThreadMsg } from 'src/models/threadMsg.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-inputbox',
  templateUrl: './inputbox.component.html',
  styleUrls: ['./inputbox.component.scss'],
})
export class InputboxComponent implements OnInit {

  private threadMsg = new ThreadMsg();

  constructor(private data: DataService) {}

  ngOnInit(): void {}

  saveNewThreadMsg(inputText: string) {
    if (inputText.length > 0) {
      this.threadMsg.messageText = inputText;
      this.threadMsg.timestamp = new Date().getTime();
      this.data.saveThreadMsg(this.threadMsg);
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
