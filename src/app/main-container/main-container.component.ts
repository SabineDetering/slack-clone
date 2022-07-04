import { Component, OnInit, ViewChild } from '@angular/core';
import { Thread } from 'src/models/thread.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { ChannelService } from 'src/services/channel.service';
import { LocalStorageService } from 'src/services/local-storage.service';
import { ThreadService } from 'src/services/thread.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent implements OnInit {

  @ViewChild('threadContainer') threadContainer: any;
  threads: Thread[] = [];
  users!: User[];
  scrollTimer!: any;

  constructor(
    public Data: DataService,
    private Auth: AuthService,
    private cs: ChannelService,
    private ts: ThreadService,
    private storage: LocalStorageService
  ) {
    this.getLastUserSessionFromLocalStorage();
  }

  ngOnInit(): void {}

  onMessageSent(event: Event) {
    setTimeout(() => {this.scrollToBottom('user added Message')}, 200);
  }

  scrollToBottom(trigger?: string) {
    if (this.cs.scrollMain || trigger == 'user added Message') {      
      this.threadContainer.nativeElement.scrollTop =
        this.threadContainer.nativeElement.scrollHeight;
      this.scrollTimer = setTimeout(() => {
        this.cs.scrollMain = false;
      }, 5000);
    }
  }

  // checks if a current channel and thread are stored in local storage for the current user and if so, sets them in Data.currentChannel$ and Data.currentThread$
  async getLastUserSessionFromLocalStorage() {
    console.log('getLastUserSessionFromLocalStorage');
    const storageSession = await this.storage.getUserSessionFromLocalStorage(
      this.Auth.currentUserId
    );
    console.log(storageSession);
    if (!storageSession) this.cs.showDefaultChannel();
    else {
      console.log('else');

      await this.cs.setCurrentChannel(storageSession);
      if (!!storageSession.threadID) {
        this.setCurrentThread(storageSession);
      }
    }
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
    if (this.Data.messagesSubscription) this.ts.deleteMessagesSubscription();
    if (this.Data.currentMessages.length > 0)
      this.Data.currentMessages$.next([]);
    this.Data.getMessagesFromThreadID(thread.threadID);
    this.Data.currentThread$.next(thread);
    this.storage.setUserSessionInLocalStorage(
      this.Auth.currentUserId,
      this.Data.currentChannel.id,
      this.Data.currentChannel.type,
      thread.threadID
    );
  }

  getTrackByCondition(index: any, thread: Thread) {
    return index + thread.firstMessageID;
  }
}
