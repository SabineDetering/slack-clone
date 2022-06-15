import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  @Input() currentThreadId: string;
  currentChannel: Channel;

  constructor(public router: Router, private Data: DataService) {}

  ngOnInit(): void {
    console.log(this.router.url);
    this.Data.currentChannel$.subscribe(channel => this.currentChannel = channel)

  }

  answerInThread() {
    console.log('answer in thread', this.currentThreadId);
  }

  setCurrentMessages(currentThreadId: string) {
    this.Data.getMessagesFromThreadID(currentThreadId);
  }
}
