import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { DataService } from 'src/services/data.service';
import { DialogAddDirectChannelComponent } from '../dialog-add-direct-channel/dialog-add-direct-channel.component';

@Component({
  selector: 'app-direct-channel-list',
  templateUrl: './direct-channel-list.component.html',
  styleUrls: ['./direct-channel-list.component.scss']
})
export class DirectChannelListComponent implements OnInit {

  directChannelsOpen = true;
  loggedInUserID: string = 'nqZXy3cBYvWQKprRI2Nq'; //replace with user from authentication
  @Input() mobile: boolean;
  users: User[];
  directChannels: DirectChannel[];


  constructor(
    public dialog: MatDialog,
    public Data: DataService
  ) { }


  async ngOnInit(): Promise<void> {
    this.users = await firstValueFrom(this.Data.users$);

    //subscribe directChannels and merge with users to get participant names
    this.Data.directChannels$.subscribe(actuals => {
      this.directChannels = actuals
        .map(dc => {
          dc = new DirectChannel(dc);
          dc.directChannelName = this.users
            .filter(user => dc.directChannelMembers.includes(user.userID) && user.userID!=this.loggedInUserID)
            .map(user => user.userName)
            .sort()
            .join(', ');
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

}


