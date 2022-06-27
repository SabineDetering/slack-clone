import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { Thread } from 'src/models/thread.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
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
  users: User[];

  constructor(public Data: DataService, private Auth: AuthService) {
    this.getCurrentChannel();
    this.getCurrentThreads();
    this.getLastUserSessionFromLocalStorage();
    /* this.getCurrentThreadFromLocalStorage(); */
  }

  ngOnInit(): void {
    /*     this.users = await firstValueFrom(this.Data.users$);
     */
  }

  ngAfterViewChecked() {
    this.threadContainer.nativeElement.scrollTop =
      this.threadContainer.nativeElement.scrollHeight;
  }

  getCurrentChannel() {
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
    /* this.getCurrentChannelFromLocalStorage(); */
  }

  getCurrentThreads() {
    this.Data.currentThreads$.subscribe((threads) => {
      this.threads = threads;
    });
  }

  async getLastUserSessionFromLocalStorage() {
    const storageSession = await this.Data.getUserSessionFromLocalStorage(
      this.Auth.currentUserId
    );
    console.log(storageSession);
    if (!storageSession) this.showDefaultChannel();
    else {
      const currentChannelIsSet = await this.setCurrentChannel(storageSession);
      if (currentChannelIsSet && !!storageSession.threadID) {
        console.log('set Thread');
        this.setCurrentThread(storageSession);
      }
    }
  }

  setCurrentChannel(storageSession: any) {
    return new Promise((resolve, reject) => {
      if (storageSession.channel.type == 'channel')
        this.setCurrentChannelToChannel(storageSession.channel.channelID);
      // is of type 'directChannel'
      else
        this.setCurrentChannelToDirectChannel(storageSession.channel.channelID);
      resolve(true);
      (err: any) => reject(err);
    });
  }

  // checks if a current channel is stored in local storage and if so, sets it in Data.currentChannel$
  /*   async getCurrentChannelFromLocalStorage() {
    const storageChannel = await this.Data.getCurrentChannelFromLocalStorage();
    console.log(storageChannel);
    if (!storageChannel) return;
    else {
      if (storageChannel.channelType == 'channel') {
        this.setCurrentChannelToChannel(storageChannel);
      } else {
        this.setCurrentChannelToDirectChannel(storageChannel);
      }
    }
  } */

  async setCurrentChannelToChannel(channelID: any) {
    console.log('setCurrentChannelToChannel');
    console.log(channelID);
    const channel = await this.Data.getChannelFromChannelID(channelID);
    if (channel) {
      this.Data.setCurrentChannelFromChannel(channel);
      this.Data.getThreadsFromChannelID(channelID);
    } else {
      this.Data.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  async setCurrentChannelToDirectChannel(directChannelID: any) {
    const directChannel = await this.Data.getChannelFromDirectChannelID(
      directChannelID
    );
    if (directChannel) {
      const directChannelWithProps = this.Data.setDirectChannelProperties(
        directChannel,
        this.Auth.currentUserId
      );
      this.Data.setCurrentChannelFromDirectChannel(directChannelWithProps);
      this.Data.getThreadsFromChannelID(directChannelID);
    } else {
      this.Data.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  showDefaultChannel() {
    console.log('show default channel');
    const showDefaultChannelSubscription = this.Data.channels$.subscribe(
      (channels) => {
        console.log(showDefaultChannelSubscription);
        this.setCurrentChannelToChannel(channels[0].channelID);
        showDefaultChannelSubscription.unsubscribe();
        console.log(showDefaultChannelSubscription);
      }
    );
  }

  async setCurrentThread(storageSession: any) {
    const thread = await this.Data.getThreadFromThreadID(
      storageSession.threadID
    );
    if (thread) {
      this.openThread(thread);
    } else {
      this.Data.setUserSessionInLocalStorage(
        this.Auth.currentUserId,
        storageSession.channel.channelID,
        storageSession.channel.type,
        null
      );
    }
  }

  /*   async getCurrentThreadFromLocalStorage() {
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
  } */

  openThread(thread: Thread) {
    console.log('open thread', thread);
    this.Data.currentThread$.next(thread);
    this.Data.setUserSessionInLocalStorage(
      this.Auth.currentUserId,
      this.currentChannel.id,
      this.currentChannel.type,
      thread.threadID
    );
    /* this.Data.setCurrentThreadInLocalStorage(thread.threadID); */
    this.Data.getMessagesFromThreadID(thread.threadID);
  }

  getTrackByCondition(index: any, thread: Thread) {
    return index + thread.firstMessageID;
  }
}
