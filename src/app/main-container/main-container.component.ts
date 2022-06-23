import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
    this.getCurrentThreadFromLocalStorage();
  }

  ngOnInit(): void {}

  ngAfterViewChecked() {
    this.threadContainer.nativeElement.scrollTop =
      this.threadContainer.nativeElement.scrollHeight;
  }

  getCurrentChannel() {
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
    this.getCurrentChannelFromLocalStorage();
  }

  // checks if a current channel is stored in local storage and if so, sets it in Data.currentChannel$
  async getCurrentChannelFromLocalStorage() {
    const storageChannel = await this.Data.getCurrentChannelFromLocalStorage();
    if (!storageChannel) return;
    else {
      if (storageChannel.channelType == 'channel') {
        this.setCurrentChannelToChannel(storageChannel);
      } else {
        this.setCurrentChannelToDirectChannel(storageChannel);
      }
    }
  }

  async setCurrentChannelToChannel(storageChannel: any) {
    const channel = await this.Data.getChannelFromChannelID(
      storageChannel.channelID
    );
    if (channel) {
      this.Data.setCurrentChannelFromChannel(channel);
      this.Data.getThreadsFromChannelID(channel.channelID);
    } else {
      this.Data.removeCurrentChannelFromLocalStorage();
    }
  }

  async setCurrentChannelToDirectChannel(storageChannel: any) {
    const directChannel = await this.Data.getChannelFromDirectChannelID(
      storageChannel.channelID
    );
    if (directChannel) {
      this.Data.setCurrentChannelFromDirectChannel(directChannel);
      this.Data.getThreadsFromChannelID(directChannel.directChannelID);
    } else {
      this.Data.removeCurrentChannelFromLocalStorage();
    }
  }

  getCurrentThreads() {
    this.Data.currentThreads$.subscribe((threads) => {
      this.threads = threads;
    });
  }

  async getCurrentThreadFromLocalStorage() {
    const storageThreadID = await this.Data.getCurrentThreadFromLocalStorage();
    if (!storageThreadID) return;
    else {
      const thread = await this.Data.getThreadFromThreadID(storageThreadID);
      if (thread) {
        this.openThread(thread);
      } else {
        this.Data.removeCurrentThreadFromLocalStorage();
      }
    }
  }

  openThread(thread: Thread) {
    console.log('open thread', thread);
    this.Data.currentThread$.next(thread);
    this.Data.setCurrentThreadInLocalStorage(thread.threadID);
    this.Data.getMessagesFromThreadID(thread.threadID);
  }

  getTrackByCondition(index: any, thread: Thread) {
    return index + thread.firstMessageID;
  }
}
