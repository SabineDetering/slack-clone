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
    private router:Router

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


  toggleDirectChannels(event: Event) {
    event.stopPropagation();
    this.directChannelsOpen = !this.directChannelsOpen;
  }


  openAddDirectChannelDialog(event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogAddDirectChannelComponent);
    dialogRef.afterClosed().subscribe((dc) => {
      console.log('dialog result', dc);
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


  async setCurrentDirectChannel(directChannel: DirectChannel) {
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


  sameAsStorageChannel(directChannelID: string) {
    if (this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId))
      return (
        directChannelID ==
        this.storage.getUserSessionFromLocalStorage(this.Auth.currentUserId)
          .channel.channelID
      );
    else return false;
  }


  closeCurrentThread() {
    this.ts.closeCurrentThread(true, this.Auth.currentUserId);
  }
}
