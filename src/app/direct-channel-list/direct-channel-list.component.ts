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
  styleUrls: ['./direct-channel-list.component.scss']
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
  ) { }


  async ngOnInit(): Promise<void> {

    this.users = await firstValueFrom(this.Data.users$);

    //subscribe directChannels and merge with users to get participant names excluding logged in user
    this.Data.directChannels$.subscribe(data => {
      this.directChannels = data
        .map(dc => {
          dc = new DirectChannel(dc);
          dc.directChannelName = this.users
            .filter(user => dc.directChannelMembers.includes(user.uid) && user.uid != this.Auth.currentUserId)
            .map(user => user.displayName ? user.displayName : 'Guest')
            .sort()
            .join(', ');
          dc.directChannelAvatar = this.users
            .filter(user => dc.directChannelMembers
              .find(member => member != this.Auth.currentUserId) == user.uid)[0]
            .photoURL;
          return dc;
        })
    })
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
    this.Data.currentChannel$.next(
      new CurrentChannel({
        type: 'directChannel',
        id: directChannel.directChannelID,
        name: directChannel.directChannelName
      })
    );
    this.Data.setCurrentChannelInLocalStorage(directChannel.directChannelID);
    this.Data.getThreadsFromChannelID(directChannel.directChannelID);
  }

}


