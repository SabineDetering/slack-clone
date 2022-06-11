import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DirectMsg } from 'src/models/directMsg.class';
import { User } from 'src/models/user.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-dialog-add-direct-msg',
  templateUrl: './dialog-add-direct-msg.component.html',
  styleUrls: ['./dialog-add-direct-msg.component.scss']
})
export class DialogAddDirectMsgComponent implements OnInit {

  dm = new DirectMsg();
  users: User[];
  members: any[];
  filteredUsers: User[];

  constructor(
    private dialogRef: MatDialogRef<DialogAddDirectMsgComponent>,
    public Data: DataService) {
  }

  async ngOnInit(): Promise<void> {
    this.users = await firstValueFrom(this.Data.users$);
    this.filteredUsers = this.users;
  }


  applyUserFilter($event: Event) {
    let filterString = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.userName.toLowerCase().includes(filterString)) || (user.userEmail.toLowerCase().includes(filterString)));
  }


  saveDirectMsg() {
    this.dm.directMsgName = this.members.map(memberArr => memberArr[1]).join(', ');
    this.dm.directMsgMembers = this.members.map(memberArr => memberArr[0]);
    console.log(this.dm);
    this.Data.saveDirectMsg(this.dm.toJSON());
    this.dialogRef.close('dm.directMsgMembers');
  }
}
