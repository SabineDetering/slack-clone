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
  loggedInUserID: string = 'nqZXy3cBYvWQKprRI2Nq'; //replace with user from authentication

  constructor(
    private dialogRef: MatDialogRef<DialogAddDirectMsgComponent>,
    public Data: DataService,
    private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  saveDirectMsg() {
    if (!this.dm.directMsgName) {
      //needs review: memberNames must be dynamic, always excluding logged in user
      let memberNames = this.members.map(memberArr => memberArr[1]);
      this.dm.directMsgName = memberNames.sort().join(', ');
    }
    this.dm.directMsgMembers = this.members.map(memberArr => memberArr[0]);
    this.dm.directMsgMembers.push(this.loggedInUserID);//replace by authentication
    console.log(this.dm);
    this.Data.saveDirectMsg(this.dm.toJSON());
    this.dialogRef.close('saved');
    this.openSnackBar('New chat has been created.');
  }
}
