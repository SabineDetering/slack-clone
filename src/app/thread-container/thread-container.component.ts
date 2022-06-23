import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { Thread } from 'src/models/thread.class';
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

  constructor(public Data: DataService) {
    this.getCurrentChannel()
    this.getCurrentThread()
  }

  ngOnInit(): void {}

  getCurrentChannel(){
    this.Data.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
  }

  getCurrentThread() {
    this.Data.currentThread$.subscribe(
      (thread) => (this.currentThread = thread)
    );
  }

  // getThreadDescription(){
  //   if(this.currentChannel instanceof Channel){
  //     return this.currentChannel.channelName
  //   } else{
  //     return this.currentChannel.directChannelMembers
  //   }
  // }

  closeThreadContainer() {
    this.Data.currentMessages$.next([]);
  }

  trackByIndex(index: any) {
    return index;
  }
}
