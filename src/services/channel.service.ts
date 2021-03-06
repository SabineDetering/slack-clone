import { Injectable } from '@angular/core';
import { Channel } from 'src/models/channel.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { User } from 'src/models/user.class';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  scrollMain = true;

  constructor(
    private Data: DataService,
    private storage: LocalStorageService,
    private Auth: AuthService
  ) { }

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

  dcWithSameMembers(memberList: string[]): DirectChannel | null {
    for (let i = 0; i < this.Data.directChannels.length; i++) {
      const dcMembers = this.Data.directChannels[i].directChannelMembers;
      if (memberList.length != dcMembers.length) {
        continue;
      } else if (memberList.sort().toString() != dcMembers.sort().toString()) {
        continue;
      } else {
        console.log('identical member list found', this.Data.directChannels[i]);
        return this.Data.directChannels[i];
      }
    }
    console.log(' no identical member list found');
    return null;
  }

  /**
   * creates directChannelName by alphabetically listing the names of the members
   * currentUser is only listed if he is the only member
   * sets directChannelAvatar to the avatar of the first name
   * @param dc - directChannel
   * @param currentUserID
   * @returns directChannel with name and avatar
   */
  setDirectChannelProperties(dc: DirectChannel, currentUserID: string) {
    let participants = this.Data.users
      .filter(
        (user) =>
          dc.directChannelMembers.includes(user.uid) &&
          (user.uid != currentUserID || dc.directChannelMembers.length == 1)
      )
      .sort((a, b) => (a.displayName < b.displayName ? -1 : 1));
    dc.directChannelName = this.getDirectChannelName(dc, participants);
    dc.directChannelAvatar = this.getDirectChannelAvatar(participants);
    dc.directChannelAllowDelete = this.currentUserIsOnlyNotDeletedChannelMember(dc, currentUserID);
    return dc;
  }

  getDirectChannelName(dc: DirectChannel, participants: User[]) {
    const dcActiveMembers = participants.map((user) => user.displayName).join(', ');
    const dcDeletedMembers = this.addDeletedMembersNames(dc);
    const dcActiveAndDeletedMembers = dcActiveMembers ? (dcDeletedMembers ? dcActiveMembers.concat(', ', dcDeletedMembers) : dcActiveMembers) : dcDeletedMembers;
    return dcActiveAndDeletedMembers;
  }

  addDeletedMembersNames(dc: DirectChannel) {
    return dc.directChannelMembers
      .filter((m) => m == '0')
      .map((m) => (m = '<span class="deleted-user">deleted user</span>'))
      .join(', ');
  }

  getDirectChannelAvatar(participants: User[]) {
    if (participants.length > 0)
      return this.Data.users.filter(
        (user) => participants[0].uid == user.uid
      )[0].photoURL;
    else return 'assets/img/avatar-unknown.png';
  }


  currentUserIsOnlyNotDeletedChannelMember(dc: DirectChannel, currentUserID: string): boolean {
    let directChannelMembersWithoutDeleted = dc.directChannelMembers.filter((dcm) => dcm != '0');
    return (
      directChannelMembersWithoutDeleted.length == 1 && directChannelMembersWithoutDeleted[0] == currentUserID
    );
  }


  showDefaultChannel() {
    const showDefaultChannelSubscription = this.Data.channels$.subscribe(
      (channels) => {
        this.setCurrentChannelToChannel(channels[0].channelID);
        this.Auth.showLoadingSpinner = false;
        showDefaultChannelSubscription.unsubscribe();
      }
    );
  }

  setCurrentChannel(storageSession: any) {
    return new Promise((resolve, reject) => {
      if (storageSession.channel.type == 'channel')
        this.setCurrentChannelToChannel(storageSession.channel.channelID);
      else
        this.setCurrentChannelToDirectChannel(storageSession.channel.channelID);
      resolve('current channel has been restored');
      (err: any) => reject(err);
    });
  }

  async setCurrentChannelToChannel(channelID: any) {
    const channel = await this.Data.getChannelFromChannelID(channelID);
    if (channel) {
      this.setCurrentChannelFromChannel(channel);
      this.Data.getThreadsFromChannelID(channelID);
    } else {
      this.storage.removeUserSessionFromLocalStorage(this.Auth.currentUserId);
    }
  }

  async setCurrentChannelToDirectChannel(directChannelID: any) {
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
    this.Data.currentChannel$.next(null);
    this.Data.currentThreads$.next([]);
    this.deleteChannelSubscription();
  }

  deleteChannelSubscription() {
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
        if (this.currentUserIsOnlyNotDeletedChannelMember(dc, userID)) {
          this.Data.deleteDirectChannel(dc.directChannelID);
          this.Data.deleteThreadsInChannel(dc.directChannelID);
          this.Data.deleteMessagesInChannel(dc.directChannelID);
        } else {
          dc.directChannelMembers[dc.directChannelMembers.indexOf(userID)] =
            '0';
          this.Data.updateDirectChannel(dc.directChannelID, {
            directChannelMembers: dc.directChannelMembers,
          });
        }
      }
    });
  }
}
