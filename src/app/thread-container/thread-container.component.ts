import { Component, OnInit } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-thread-container',
  templateUrl: './thread-container.component.html',
  styleUrls: ['./thread-container.component.scss']
})
export class ThreadContainerComponent implements OnInit {

  currentChannel: Channel | DirectChannel;

  constructor(public Data: DataService) { 
    this.Data.currentChannel$.subscribe(channel => {
      this.currentChannel = channel;
   console.log(this.currentChannel)})}

  ngOnInit(): void {
  }

}
