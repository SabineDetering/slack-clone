import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { Thread } from 'src/models/thread.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-thread-container',
  templateUrl: './thread-container.component.html',
  styleUrls: ['./thread-container.component.scss'],
})
export class ThreadContainerComponent implements OnInit {
  // currentChannel: Channel | DirectChannel;
  currentChannel: CurrentChannel;
  currentThread: Thread;

  constructor(public Data: DataService, private Auth: AuthService) {
    this.getCurrentChannel();
    this.getCurrentThread();
  }

  ngOnInit(): void {}

  getCurrentChannel() {
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = new CurrentChannel(channel);
    });
  }

  getCurrentThread() {
    this.Data.currentThread$.subscribe((thread) => {
      this.currentThread = new Thread(thread);
    });
  }

  closeThreadContainer(){
    this.Data.closeCurrentThread(true, this.Auth.currentUserId);
  }

  trackByIndex(index: any) {
    return index;
  }
}
