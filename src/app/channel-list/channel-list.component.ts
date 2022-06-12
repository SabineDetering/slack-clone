import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Channel } from 'src/models/channel.class';
import { DataService } from 'src/services/data.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';

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

  openAddChannelDialog(event: Event) {
    event.stopPropagation();
    this.dialog.open(DialogAddChannelComponent);
  }

  setCurrentChannel(channel:Channel) {
    this.Data.currentChannel = channel;
  }


}
