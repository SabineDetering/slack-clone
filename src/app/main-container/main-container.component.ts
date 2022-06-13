import { Component, OnInit } from '@angular/core';;
import { Channel } from 'src/models/channel.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {

  currentChannel: Channel;
  threads: Thread[] = [];

  constructor(public Data: DataService) { 
    this.Data.currentChannel$.subscribe(channel => {
      this.currentChannel = channel;
    });
   }

  ngOnInit(): void {
    // this.Data.threads$.subscribe(threads => { 
    //   console.log( this.Data.threads$);
      
    //     });
  }

}
