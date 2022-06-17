import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent implements OnInit {
  // currentChannel: Channel;
  currentChannel: CurrentChannel;
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


  openThread(thread: Thread){
    this.Data.currentThread$.next(thread);
    this.Data.getMessagesFromThreadID(thread.threadID);
  }
}
