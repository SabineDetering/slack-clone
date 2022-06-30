import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-dialog-add-direct-channel',
  templateUrl: './dialog-add-direct-channel.component.html',
  styleUrls: ['./dialog-add-direct-channel.component.scss']
})
export class DialogAddDirectChannelComponent implements OnInit {

  dm = new DirectChannel();
  users: User[];

  constructor(
    private dialogRef: MatDialogRef<DialogAddDirectChannelComponent>,
    public Data: DataService,
    public Auth: AuthService,
    private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  async saveDirectChannel() {
    //currentUser must always be part of member list
    if (!this.dm.directChannelMembers.includes(this.Auth.currentUserId)) {
      this.dm.directChannelMembers.push(this.Auth.currentUserId);
    }
    this.Data.saveDirectChannel(this.dm.toJSON())
      .then(docRef => {
        this.dm.directChannelID = docRef.id;
        console.log('created dc', this.dm);
        this.openSnackBar('New chat has been created.');
        this.dialogRef.close(this.dm.toJSON());
      })
      .catch(error => console.error('error adding direct channel to firestore: ', error));
  }
}
