import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/services/data.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {

  
  constructor(
    public dialog: MatDialog,
    public Data:DataService
  ) { }

  ngOnInit(): void {
  }

  openAddChannelDialog() {
    this.dialog.open(DialogAddChannelComponent);
  }

}
