import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message-actions',
  templateUrl: './message-actions.component.html',
  styleUrls: ['./message-actions.component.scss'],
})
export class MessageActionsComponent implements OnInit {
  @Input() thread: Thread;
  currentChannel: Channel;

  constructor(public router: Router, private Data: DataService) {}

  ngOnInit(): void {
    console.log(this.router.url);
    this.Data.currentChannel$.subscribe(channel => this.currentChannel = channel)

  }

  answerInThread() {
    console.log('answer in thread', this.thread.threadID);
  }

  setCurrentMessages() {
    this.Data.currentThread$.next(this.thread);
    this.Data.getMessagesFromThreadID(this.thread.threadID);
  }
}
