import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/models/channel.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { ChannelService } from 'src/services/channel.service';
import { DialogChannelComponent } from '../dialog-channel/dialog-channel.component';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { ThreadService } from 'src/services/thread.service';
import { LocalStorageService } from 'src/services/local-storage.service';
@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss'],
})
export class ChannelListComponent implements OnInit {
  channelsOpen = true;
  @Input() mobile!: boolean;
  @Input() touchScreen!: boolean;

  constructor(
    public dialog: MatDialog,
    private Auth: AuthService,
    public Data: DataService,
    private cs: ChannelService,
    private ts: ThreadService,
    private storage: LocalStorageService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void { }


  toggleChannels(event: Event) {
    event.stopPropagation();
    this.channelsOpen = !this.channelsOpen;
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  /**
   * if user is registered:opens dialog to create new channel or edit existing channel 
   * otherwise: info dialog
   * @param channel - channel to be edited; if null, new channel is created
   */
  openChannelDialog(channel?: Channel) {
    if (this.Auth.currentUser.currentUser.isAnonymous && !!channel) {
      this.refuseChannelEdit(channel);
    } else {//registered user
      this.dialog.open(DialogChannelComponent, { data: channel });
    }
  }


  handleDelete(channel: Channel) {
    if (this.Auth.currentUser.currentUser.isAnonymous) {
      this.refuseDeletion(channel);
    } else {//registered user
      this.openDeleteConfirmation(channel)
    }
  }


  openDeleteConfirmation(channel: Channel) {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Delete Channel ' + channel.channelName,
        text: "This will completely delete the channel and its contents for all users and can't be undone.",
        question: "Do you really want to proceed?",
        discardText: 'No',
        confirmText: 'Yes',
      },
    });
    confirmationRef.afterClosed().subscribe((result) => {
      if (result == 'confirm') {
        this.deleteChannel(channel.channelID);
        this.openSnackBar('Channel has been deleted.');
      }
    });
  }


  /**
   * inform (anonymous) user that he is not eligible for editing channels
   * @param channel 
   */
  refuseChannelEdit(channel: Channel) {
    this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Editing channel ' + channel.channelName,
        text: "Editing channels is only eligible for registered users.You are currently logged in as guest. To proceed, please register or log in with a registered email address.",
        confirmText: 'Ok'
      }
    });
  }


  /**
   * inform (anonymous) user that he is not eligible for deleting channels
   * @param channel 
   */
  refuseDeletion(channel: Channel) {
    this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Deleting channel ' + channel.channelName,
        text: "Deleting channels is only eligible for registered users.You are currently logged in as guest. To proceed, please register or log in with a registered email address.",
        confirmText: 'Ok'
      }
    });
  }


  deleteChannel(channelID: string) {
    this.updateObservablesAndLocalStorage(channelID);
    this.Data.deleteThreadsInChannel(channelID);
    this.Data.deleteMessagesInChannel(channelID);
    this.Data.deleteChannel(channelID);
  }


  updateObservablesAndLocalStorage(channelID: string) {
    if (this.Data.currentChannel.id == channelID) {
      if (this.Data.currentThread) {
        this.ts.closeCurrentThread();
      }
      this.Data.currentChannel$.next(null);
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
      this.cs.showDefaultChannel();
    }
  }


  setCurrentChannel(channel: Channel) {
    if (!this.sameAsStorageChannel(channel.channelID)) {
      this.cs.deleteChannelSubscription();
      this.cs.setCurrentChannelFromChannel(channel);
      this.storage.setUserSessionInLocalStorage(
        this.Auth.currentUserId,
        channel.channelID,
        'channel',
        null
      );
      this.Data.getThreadsFromChannelID(channel.channelID);
      this.cs.scrollMain = true;
      if (this.Data.currentThread) {
        this.ts.closeCurrentThread(true, this.Auth.currentUserId);
      }
    }
  }


  sameAsStorageChannel(channelID: string) {
    if (this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId))
      return (
        channelID ==
        this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId)
          .channel.channelID
      );
    else return false;
  }
}
