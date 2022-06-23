import { AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent implements OnInit, AfterViewChecked {
  
  @ViewChild('threadContainer') threadContainer: any;
  currentChannel: CurrentChannel;
  threads: Thread[] = [];

  constructor(public Data: DataService) {
    this.getCurrentChannel();
    this.getCurrentThreads();
  }

  ngOnInit(): void {  }

  ngAfterViewChecked() {
    this.threadContainer.nativeElement.scrollTop = this.threadContainer.nativeElement.scrollHeight;
  }

  getCurrentChannel() {
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
  }

  getCurrentThreads() {
    this.Data.currentThreads$.subscribe((threads) => {
      this.threads = threads;
    });
  }

  openThread(thread: Thread) {
    console.log('open thread', thread);
    this.Data.currentThread$.next(thread);
    this.Data.setCurrentThreadInLocalStorage(thread.threadID);
    this.Data.getMessagesFromThreadID(thread.threadID);
  }

  getTrackByCondition(index: any, thread: Thread){
    return index + thread.firstMessageID;
  }

}
