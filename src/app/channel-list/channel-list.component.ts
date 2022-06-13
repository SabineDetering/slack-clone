import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Channel } from 'src/models/channel.class';
import { DataService } from 'src/services/data.service';
import { DialogChannelComponent } from '../dialog-channel/dialog-channel.component';
@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {

  channelsOpen = true;
  @Input() mobile: boolean;

  constructor(
    public dialog: MatDialog,
    public Data: DataService
  ) { }

  ngOnInit(): void {
  }


  toggleChannels(event: Event) {
    event.stopPropagation();
    this.channelsOpen = !this.channelsOpen;
  }


  openChannelDialog(channel?:Channel) {
    this.dialog.open(DialogChannelComponent,{data:channel});
  }


  async setCurrentChannel(channel:Channel) {
    this.Data.currentChannel$.next(channel);
    await this.Data.getThreadsFromChannelID(channel.channelID);
  }

}
