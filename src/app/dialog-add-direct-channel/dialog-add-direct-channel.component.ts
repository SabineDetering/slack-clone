import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
import { ChannelService } from 'src/services/channel.service';
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
    public cs: ChannelService,
    public Auth: AuthService,
    private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  async handleNewDirectChannel(): Promise<void> {
    this.addCurrentUserToDCMembers();
    let duplicate = this.cs.dcWithSameMembers(this.dm.directChannelMembers);
    if (!duplicate) {
      await this.saveDirectChannel();
    } else {
      this.informAboutDuplicate(duplicate);
    }
  }

  
  addCurrentUserToDCMembers(): void {
    if (!this.dm.directChannelMembers.includes(this.Auth.currentUserId)) {
      this.dm.directChannelMembers.push(this.Auth.currentUserId);
    }
  }


  createUniqueDCId(): string {
    return 'dc' + Date.now() + Math.round(Math.random() * 100);
  }


  async saveDirectChannel(): Promise<void> {
    this.dm.directChannelID = this.createUniqueDCId();
    this.Data.saveDirectChannel(this.dm.toJSON())
      .then(() => {
        console.log('created dc', this.dm);
        this.openSnackBar('New chat has been created.');
        this.dialogRef.close(this.dm);
      })
      .catch(error => {
        this.openSnackBar("Chat couldn't be saved.");
        console.error('error saving direct channel: ', error)
      });
  }


  informAboutDuplicate(duplicate: DirectChannel): void {
    this.openSnackBar('You already have a chat with these participants.');
    this.dialogRef.close(duplicate);
  }
}
