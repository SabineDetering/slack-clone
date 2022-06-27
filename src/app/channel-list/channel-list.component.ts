import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { DialogChannelComponent } from '../dialog-channel/dialog-channel.component';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss'],
})
export class ChannelListComponent implements OnInit {
  channelsOpen = true;
  @Input() mobile!: boolean;

  constructor(
    public dialog: MatDialog,
    private Auth: AuthService,
    public Data: DataService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  toggleChannels(event: Event) {
    event.stopPropagation();
    this.channelsOpen = !this.channelsOpen;
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }

  openChannelDialog(channel?: Channel) {
    this.dialog.open(DialogChannelComponent, { data: channel });
  }

  openDeleteConfirmation(channel: Channel) {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        title: 'Delete Channel',
        text: "This will completely delete the channel and its contents for all users and can't be undone. Do you really want to proceed?",
        discardText: 'No',
        confirmText: 'Yes',
      },
    });
    confirmationRef.afterClosed().subscribe((result) => {
      if (result == 'confirm') {
        this.Data.deleteChannel(channel.channelID);
        //TODO: delete all Threads and messages of that channel
        this.openSnackBar('Channel has been deleted.');
      }
    });
  }

  setCurrentChannel(channel: Channel) {
    if (channel.channelID != this.Data.getCurrentChannelFromLocalStorage()) {
      this.Data.setCurrentChannelFromChannel(channel);
      /* this.Data.setCurrentChannelInLocalStorage({ channelID: channel.channelID, channelType: 'channel' }); */
      const sessionData = {
        userID: this.Auth.currentUserId,
        channel: { channelID: channel.channelID, type: 'channel' },
        threadID: null,
      };
      this.Data.setUserSessionInLocalStorage(sessionData);
      this.Data.getThreadsFromChannelID(channel.channelID);
      this.Data.closeCurrentThread(true);
    }
  }

  // closeCurrentThread() {
  //   this.Data.closeCurrentThread(true);
  // }
}
