import { Injectable } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  scrollMain = true;

  constructor(private Data: DataService, private storage: LocalStorageService, private Auth: AuthService) { }

  setCurrentChannelFromChannel(channel: Channel) {
    console.log('setCurrentChannelFromChannel')
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

    showDefaultChannel() {
      console.log('showDefaultChannel')
    const showDefaultChannelSubscription = this.Data.channels$.subscribe(
      (channels) => {
        this.setCurrentChannelToChannel(channels[0].channelID);
        showDefaultChannelSubscription.unsubscribe();
      }
    );
  }

  setCurrentChannel(storageSession: any) {
    console.log('setCurrentChannel')
    return new Promise((resolve, reject) => {
      if (storageSession.channel.type == 'channel')
        this.setCurrentChannelToChannel(storageSession.channel.channelID);
      // is of type 'directChannel'
      else
        this.setCurrentChannelToDirectChannel(storageSession.channel.channelID);
      resolve('current channel has been restored');
      (err: any) => reject(err);
    });
  }

  async setCurrentChannelToChannel(channelID: any) {
    console.log('setCurrentChannelToChannel')
    console.log('setCurrentChannelToChannel ', channelID)

    const channel = await this.Data.getChannelFromChannelID(channelID);
    console.log(channel)
    if (channel) {
      this.setCurrentChannelFromChannel(channel);
      this.Data.getThreadsFromChannelID(channelID);
    } else {
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  async setCurrentChannelToDirectChannel(directChannelID: any) {
    console.log('setCurrentChannelToDirectChannel')

    const directChannel = await this.Data.getChannelFromDirectChannelID(
      directChannelID
    );
    if (directChannel) {
      const directChannelWithProps = this.setDirectChannelProperties(
        directChannel,
        this.Auth.currentUserId
      );
      this.setCurrentChannelFromDirectChannel(directChannelWithProps);
      this.Data.getThreadsFromChannelID(directChannelID);
    } else {
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
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
