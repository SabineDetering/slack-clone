import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from 'src/services/data.service';
import { DialogAddDirectMsgComponent } from '../dialog-add-direct-msg/dialog-add-direct-msg.component';

@Component({
  selector: 'app-direct-msg-list',
  templateUrl: './direct-msg-list.component.html',
  styleUrls: ['./direct-msg-list.component.scss']
})
export class DirectMsgListComponent implements OnInit {

  directMsgOpen = true;
  @Input() mobile: boolean;

  constructor(
    public dialog: MatDialog,
    public Data: DataService
  ) { }

  ngOnInit(): void {
  }

  toggleDirectMsg(event: Event) {
    event.stopPropagation();
    this.directMsgOpen = !this.directMsgOpen;
  }

  openAddDirectMsgDialog(event: Event) {
    event.stopPropagation();
    this.dialog.open(DialogAddDirectMsgComponent);
  }


}


