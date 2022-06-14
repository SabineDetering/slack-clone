import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss']
})
export class MessageActionsComponent implements OnInit {

  @Input() currentThreadId: string;

  constructor() { }

  ngOnInit(): void {
  }

  answerInThread(){
    console.log('answer in thread', this.currentThreadId)
  }

}
