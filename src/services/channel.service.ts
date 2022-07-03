import { Injectable } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  scrollMain = true;

  constructor(private Data: DataService) { }

  setCurrentChannelFromChannel(channel: Channel) {
    this.Data.currentChannel$.next(
      new CurrentChannel({
        type: 'channel',
        id: channel.channelID,
        name: channel.channelName,
        description: channel.channelDescription,
      })
    );
  }

  setCurrentChannelFromDirectChannel(directChannel: DirectChannel) {
    this.Data.currentChannel$.next(
      new CurrentChannel({
        type: 'directChannel',
        id: directChannel.directChannelID,
        name: directChannel.directChannelName,
      })
    );
  }


  setDirectChannelProperties(dc: DirectChannel, currentUserID: string) {
    // dc = new DirectChannel(dc);
    dc.directChannelName = this.Data.users
      .filter(
        (user) =>
          dc.directChannelMembers.includes(user.uid) &&
          (user.uid != currentUserID || dc.directChannelMembers.length == 1)
      )
      .map((user) => user.displayName)
      .sort()
      .join(', ');
    dc.directChannelAvatar = this.Data.users.filter(
      (user) => dc.directChannelMembers[0] == user.uid
    )[0].photoURL;
    return dc;
  }


  closeCurrentChannel() {
    console.log('closeCurrentChannel');
    this.Data.currentChannel$.next(null);
    this.Data.currentThreads$.next([]);
    this.deleteChannelSubscription();
  }


  deleteChannelSubscription() {
    console.log('deleteChannelSubscription');
    if (this.Data.channelSubscription) {
      this.Data.channelSubscription.unsubscribe();
    } else return;
  }


    /**
   * if User is the only member in direct channel, the channel  is deleted
   * if User is one of several members, userID is deleted from member list
   * @param userID
   */
     deleteUserFromDirectChannels(userID: string) {
      this.Data.directChannels.forEach((dc) => {
        if (dc.directChannelMembers.includes(userID)) {
          if (dc.directChannelMembers.length == 1) {
            this.Data.deleteDirectChannel(dc.directChannelID);
            this.Data.deleteThreadsInChannel(dc.directChannelID);
            this.Data.deleteMessagesInChannel(dc.directChannelID);
          } else {
            dc.directChannelMembers.splice(
              dc.directChannelMembers.indexOf(userID),
              1
            );
            this.Data.updateDirectChannel(dc.directChannelID, {
              directChannelMembers: dc.directChannelMembers,
            });
          }
        }
      });
    }

}
