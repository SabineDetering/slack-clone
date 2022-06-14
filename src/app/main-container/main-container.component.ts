import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent implements OnInit {
  currentChannel: Channel;
  threads: Thread[] = [];

  constructor(public Data: DataService) {
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
    // threads$ are set with click on channel in left Menu (see component channel-list)
    this.Data.currentThreads$.subscribe((threads) => {
      this.threads = threads;
    });
  }

  ngOnInit(): void {}

  getFirstThreadMessage(){
    return new Message()  // has to be changed
  }

  openThread(thread: Thread){
    this.Data.getMessagesFromThreadID(thread.threadID);
  }
}
