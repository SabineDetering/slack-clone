import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { DialogAddDirectChannelComponent } from '../dialog-add-direct-channel/dialog-add-direct-channel.component';

@Component({
  selector: 'app-direct-channel-list',
  templateUrl: './direct-channel-list.component.html',
  styleUrls: ['./direct-channel-list.component.scss'],
})
export class DirectChannelListComponent implements OnInit {
  directChannelsOpen = true;
  @Input() mobile: boolean;
  users: User[];
  directChannels: DirectChannel[];

  constructor(
    public dialog: MatDialog,
    public Data: DataService,
    public Auth: AuthService
  ) {}

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
          const directChannel = this.Data.setDirectChannelProperties(
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
    this.dialog.open(DialogAddDirectChannelComponent);
  }

  async setCurrentDirectChannel(directChannel: DirectChannel) {
    this.Data.setCurrentChannelFromDirectChannel(directChannel);
    /*     this.Data.setCurrentChannelInLocalStorage({ channelID: directChannel.directChannelID, channelType: 'directChannel' }); */
    const sessionData = {
      userID:  this.Auth.currentUserId,
      channel: {
        channelID: directChannel.directChannelID,
        type: 'directChannel',
      },
      threadID: null,
    };
    this.Data.setUserSessionInLocalStorage(sessionData);
    this.Data.getThreadsFromChannelID(directChannel.directChannelID);
    this.closeCurrentThread();
  }

  closeCurrentThread() {
    this.Data.closeCurrentThread(true);
  }
}
