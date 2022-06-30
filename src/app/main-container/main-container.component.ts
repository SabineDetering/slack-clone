import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
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
import { ChannelService } from 'src/services/channel.service';
import { LocalStorageService } from 'src/services/local-storage.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent implements OnInit {
  @ViewChild('threadContainer') threadContainer: any;
  threads: Thread[] = [];
  users: User[];

  constructor(
    public Data: DataService,
    private Auth: AuthService,
    private cs: ChannelService,
    private storage: LocalStorageService
  ) {
    this.getLastUserSessionFromLocalStorage();
  }

  ngOnInit(): void {}

  scrollToBottom() {
    this.threadContainer.nativeElement.scrollTop =
      this.threadContainer.nativeElement.scrollHeight;
  }

  // checks if a current channel and thread are stored in local storage for the current user and if so, sets them in Data.currentChannel$ and Data.currentThread$
  async getLastUserSessionFromLocalStorage() {
    const storageSession = await this.storage.getUserSessionFromLocalStorage(
      this.Auth.currentUserId
    );
    if (!storageSession) this.showDefaultChannel();
    else {
      await this.setCurrentChannel(storageSession);
      if (!!storageSession.threadID) {
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
      resolve('current channel has been restored');
      (err: any) => reject(err);
    });
  }

  async setCurrentChannelToChannel(channelID: any) {
    const channel = await this.Data.getChannelFromChannelID(channelID);
    if (channel) {
      this.cs.setCurrentChannelFromChannel(channel);
      this.Data.getThreadsFromChannelID(channelID);
    } else {
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  async setCurrentChannelToDirectChannel(directChannelID: any) {
    const directChannel = await this.Data.getChannelFromDirectChannelID(
      directChannelID
    );
    if (directChannel) {
      const directChannelWithProps = this.cs.setDirectChannelProperties(
        directChannel,
        this.Auth.currentUserId
      );
      this.cs.setCurrentChannelFromDirectChannel(directChannelWithProps);
      this.Data.getThreadsFromChannelID(directChannelID);
    } else {
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  showDefaultChannel() {
    const showDefaultChannelSubscription = this.Data.channels$.subscribe(
      (channels) => {
        this.setCurrentChannelToChannel(channels[0].channelID);
        showDefaultChannelSubscription.unsubscribe();
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
      this.storage.setUserSessionInLocalStorage(
        this.Auth.currentUserId,
        storageSession.channel.channelID,
        storageSession.channel.type,
        null
      );
    }
  }

  openThread(thread: Thread) {
    console.log('open thread', thread);
    this.Data.currentThread$.next(thread);
    this.storage.setUserSessionInLocalStorage(
      this.Auth.currentUserId,
      this.Data.currentChannel.id,
      this.Data.currentChannel.type,
      thread.threadID
    );
    this.Data.getMessagesFromThreadID(thread.threadID);
  }

  getTrackByCondition(index: any, thread: Thread) {
    return index + thread.firstMessageID;
  }
}
