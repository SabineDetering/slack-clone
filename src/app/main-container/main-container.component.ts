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
  currentChannel: CurrentChannel;
  threads: Thread[] = [];

  constructor(public Data: DataService) {
    this.getCurrentChannel();
    this.getCurrentThreads();
  }

  ngOnInit(): void {}

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

  // async getMessagesPerThread(thread: Thread){
  //   let messageAmount: number = 0;; 

  //   this.Data.getMessageAmountFromThreadID(thread.threadID)
  //   .subscribe((messages) => {
  //      messageAmount = messages.length;       
  //   }); 
  //   return 1

  // }

  // async getMessageAmountFromThreadID(threadID: string){
  //   // let amount = await this.Data.getMessageAmountFromThreadID(threadID);
  //   // console.log(amount);
    
  // }

  openThread(thread: Thread) {
    console.log('open thread', thread);
    
    this.Data.currentThread$.next(thread);
    this.Data.getMessagesFromThreadID(thread.threadID);
  }

  trackByIndex(index: any) {
    return index;
  }

}
