import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DirectMsg } from 'src/models/directMsg.class';
import { User } from 'src/models/user.class';
import { DataService } from 'src/services/data.service';
import { DialogAddDirectMsgComponent } from '../dialog-add-direct-msg/dialog-add-direct-msg.component';

@Component({
  selector: 'app-direct-msg-list',
  templateUrl: './direct-msg-list.component.html',
  styleUrls: ['./direct-msg-list.component.scss']
})
export class DirectMsgListComponent implements OnInit {

  directMsgOpen = true;
  loggedInUserID: string = 'nqZXy3cBYvWQKprRI2Nq'; //replace with user from authentication
  @Input() mobile: boolean;
  users: User[];
  directMsg: DirectMsg[];


  constructor(
    public dialog: MatDialog,
    public Data: DataService
  ) { }


  async ngOnInit(): Promise<void> {
    this.users = await firstValueFrom(this.Data.users$);

    this.Data.directMsg$.subscribe(actuals => {
      this.directMsg = actuals;
      this.directMsg.forEach(dm => {
        let names = [];
        for (let i = 0; i < dm.directMsgMembers.length; i++) {
          const memberID = dm.directMsgMembers[i];
          if (memberID != this.loggedInUserID) {//replace with user from authentication
            let name = this.users.filter(user => user.userID == memberID).map(user => user.userName)[0];
            names.push(name);
          }
        }
        dm.directMsgName = names.sort().join(', ');
      })
    })
  }

  toggleDirectMsg(event: Event) {
    event.stopPropagation();
    this.directMsgOpen = !this.directMsgOpen;
  }

  openAddDirectMsgDialog(event: Event) {
    event.stopPropagation();
    this.dialog.open(DialogAddDirectMsgComponent);
  }

  getMemberNames(directMsgID: string) {

  }


}


