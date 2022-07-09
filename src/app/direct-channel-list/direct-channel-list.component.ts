import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { ChannelService } from 'src/services/channel.service';
import { DialogAddDirectChannelComponent } from '../dialog-add-direct-channel/dialog-add-direct-channel.component';
import { ThreadService } from 'src/services/thread.service';
import { LocalStorageService } from 'src/services/local-storage.service';
import { Router } from '@angular/router';
import { DialogConfirmationComponent } from '../dialog-confirmation/dialog-confirmation.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-direct-channel-list',
  templateUrl: './direct-channel-list.component.html',
  styleUrls: ['./direct-channel-list.component.scss'],
})
export class DirectChannelListComponent implements OnInit {
  directChannelsOpen = true;
  @Input() mobile!: boolean;
  @Input() touchScreen!: boolean;
  users: User[];
  directChannels: DirectChannel[];

  constructor(
    public dialog: MatDialog,
    public Data: DataService,
    public Auth: AuthService,
    private cs: ChannelService,
    private ts: ThreadService,
    private storage: LocalStorageService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }


  async ngOnInit(): Promise<void> {
    //subscribe directChannels and merge with users to get participant names excluding logged in user
    this.Data.directChannels$.subscribe((data) => {
      this.directChannels = data
        .filter(
          //only direct channels of current user
          (dc) => dc.directChannelMembers.includes(this.Auth.currentUserId)
        )
        .map((dc) => {
          //get names and avatar for direct channel
          const directChannel = this.cs.setDirectChannelProperties(
            dc,
            this.Auth.currentUserId
          );
          return directChannel;
        });
    });
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  toggleDirectChannels(event: Event): void {
    event.stopPropagation();
    this.directChannelsOpen = !this.directChannelsOpen;
  }


  openAddDirectChannelDialog(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogAddDirectChannelComponent);
    dialogRef.afterClosed().subscribe((dc) => {
      if (dc) {
        const directChannel = this.cs.setDirectChannelProperties(
          dc,
          this.Auth.currentUserId
        );
        this.setCurrentDirectChannel(directChannel);
        this.router.navigate(['/channel']);
      }
    })
  }


  async setCurrentDirectChannel(directChannel: DirectChannel): Promise<void> {
    // set new channel only if it's not the same as the last opened channel
    if (!this.sameAsStorageChannel(directChannel.directChannelID)) {
      this.cs.deleteChannelSubscription();
      this.cs.setCurrentChannelFromDirectChannel(directChannel);
      this.storage.setUserSessionInLocalStorage(
        this.Auth.currentUserId,
        directChannel.directChannelID,
        'directChannel',
        null
      );
      this.Data.getThreadsFromChannelID(directChannel.directChannelID);
      if (this.Data.currentThread) {
        this.closeCurrentThread();
      }
    }
  }


  sameAsStorageChannel(directChannelID: string): boolean {
    if (this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId))
      return (
        directChannelID ==
        this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId)
          .channel.channelID
      );
    else return false;
  }


  openDeleteConfirmation(directChannel: DirectChannel) {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Delete Chat',
        text: "This will completely delete the direct channel and all its contents and can't be undone.",
        question: "Do you really want to proceed?",
        discardText: 'No',
        confirmText: 'Yes',
      },
    });
    confirmationRef.afterClosed().subscribe((result) => {
      if (result == 'confirm') {
        this.deleteDirectChannel(directChannel.directChannelID);
        this.openSnackBar('Direct channel has been deleted.');
      }
    });
  }


  async deleteDirectChannel(channelID: string) {
    this.updateObservablesAndLocalStorage(channelID);
    this.Data.deleteThreadsInChannel(channelID);
    this.Data.deleteMessagesInChannel(channelID);
    await this.Data.deleteDirectChannel(channelID);
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


  closeCurrentThread(): void {
    this.ts.closeCurrentThread(true, this.Auth.currentUserId);
  }

}
