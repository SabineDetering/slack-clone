import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {

  currentChannel: Channel;

  constructor(public Data: DataService) { 
  //  this.Data.currentChannel = this.currentChannel;
   console.log(this.Data.currentChannel);
   }

  ngOnInit(): void {
  }

}
