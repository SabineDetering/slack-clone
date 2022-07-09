import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DataService } from 'src/services/data.service';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';

@Component({
  selector: 'app-dialog-channel',
  templateUrl: './dialog-channel.component.html',
  styleUrls: ['./dialog-channel.component.scss']
})
export class DialogChannelComponent implements OnInit {

  public channel!: Channel;

  constructor(
    public dialogRef: MatDialogRef<DialogChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Channel,
    public dialog: MatDialog,
    private Data: DataService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.channel = new Channel(this.data)
    } else {
      this.channel = new Channel();
    }
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  handleEditedChannel() {
    //ask for confirmation before saving
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Save Changes',
        text: 'Your changes will be visible for all other users.',
        question: 'Do you want to proceed?',
        discardText: 'Discard changes',
        confirmText: 'Save changes'
      }
    });
    confirmationRef.afterClosed().subscribe(result => {
      if (result == 'confirm') {
        this.saveEditedChannel();
      } else {
        this.openSnackBar('Changes have been discarded.');
      }
    })
  }


  saveEditedChannel() {
    this.Data.saveEditedChannel(this.channel.toJSON());
    this.Data.currentChannel$.next(new CurrentChannel({
      type: 'channel',
      id: this.channel.channelID,
      name: this.channel.channelName,
      description: this.channel.channelDescription
    }));
    this.openSnackBar('Channel name or description has been changed.');
  }


  addChannel() {
    this.channel.channelID = this.createUniqueChannelId();
    this.Data.addChannel(this.channel.toJSON())
      .then(() => {
        console.log('created channel', this.channel);
        this.openSnackBar('New channel has been created.');
      })
      .catch(error => {
        console.error('error saving direct channel: ', error);
        this.openSnackBar("Chat couldn't be saved.");
      });
  }


  createUniqueChannelId(): string {
    return 'c' + Date.now() + Math.round(Math.random() * 100);
  }

}
