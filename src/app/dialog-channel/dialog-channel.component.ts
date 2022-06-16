import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/models/channel.class';
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


  /**
   * save edited channel, if user confirms, discard changes otherwise
   */
  saveEditedChannel() {
    console.log('saveEdited');
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        title: 'Save Changes',
        text: 'Your changes will be visible for all other users. Do you want to proceed?',
        discardText: 'Discard changes',
        confirmText: 'Save changes'
      }
    });
    confirmationRef.afterClosed().subscribe(result => {
      if (result == 'confirm') {
        this.Data.saveEditedChannel(this.channel.toJSON());
        this.openSnackBar('Channel name or description has been changed.');
      } else {
        this.openSnackBar('Changes have been discarded.');
      }
    })
  }


  /**
   * add a new channel
   */
  addChannel() {
    console.log('add');
    this.Data.addChannel(this.channel.toJSON());
    this.openSnackBar('New channel has been created.');
  }

}
