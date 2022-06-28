import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import {
  BehaviorSubject,
  firstValueFrom,
  map,
  Observable,
  Subscription,
} from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { Thread } from 'src/models/thread.class';
import { Message } from 'src/models/message.class';
import { User } from 'src/models/user.class';
import { CurrentChannel } from 'src/models/current-channel.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private channelCollection: AngularFirestoreCollection<Channel>;
  public channels$: Observable<Channel[]>;

  private userCollection: AngularFirestoreCollection<User>;
  public users$: Observable<User[]>;

  private directChannelCollection: AngularFirestoreCollection<DirectChannel>;
  public directChannels$: Observable<DirectChannel[]>;

  public currentThreads$: BehaviorSubject<Thread[]> = new BehaviorSubject([]);
  private threadsCollection: AngularFirestoreCollection<Thread>;

  public currentMessages$: BehaviorSubject<Message[]> = new BehaviorSubject([]);
  private messageCollection: AngularFirestoreCollection<Message>;

  public currentChannel$: BehaviorSubject<CurrentChannel> = new BehaviorSubject(
    null
  );
  public currentThread$: BehaviorSubject<any> = new BehaviorSubject(null);

  private users: User[];
  public directChannels: DirectChannel[];

  private threadSubscription!: Subscription;
  /*   public currentThread$: BehaviorSubject<any> = new BehaviorSubject(
    new Thread()
  ); */

  // public currentDirectChannel$: BehaviorSubject<DirectChannel> =
  //   new BehaviorSubject(new DirectChannel());

  constructor(private readonly firestore: AngularFirestore) {
    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({
      idField: 'channelID',
    });

    this.userCollection = this.firestore.collection<User>('users');
    this.users$ = this.userCollection.valueChanges({ idField: 'userID' });

    this.messageCollection = this.firestore.collection<Message>('messages');
    this.threadsCollection = this.firestore.collection<Thread>('threads');

    this.directChannelCollection =
      this.firestore.collection<DirectChannel>('direct-channels');

    this.directChannels$ = this.directChannelCollection.valueChanges({
      idField: 'directChannelID',
    });

    this.subscribeToUsers();
    this.subscribeToDirectChannels();
  }

  subscribeToUsers() {
    this.users$.subscribe((users) => (this.users = users));
  }

  subscribeToDirectChannels() {
    this.directChannels$.subscribe((dc) => (this.directChannels = dc));
  }

  async getChannelFromChannelID(channelID: string) {
    return (await firstValueFrom(
      this.channelCollection
        .doc(channelID)
        .valueChanges({ idField: 'channelID' })
    )) as Channel;
  }

  async getChannelFromDirectChannelID(channelID: string) {
    return (await firstValueFrom(
      this.directChannelCollection
        .doc(channelID)
        .valueChanges({ idField: 'directChannelID' })
    )) as DirectChannel;
  }

  async getThreadFromThreadID(threadID: string) {
    return (await firstValueFrom(
      this.threadsCollection.doc(threadID).valueChanges()
    )) as Thread;
  }

  async getMessageFromMessageId(messageId: string) {
    return (await firstValueFrom(
      this.messageCollection.doc(messageId).valueChanges()
    )) as Message;
  }

  getThreadsFromChannelID(channelID: string): void {
    this.firestore
      .collection<Thread>('threads', (ref) =>
        ref.where('channelID', '==', channelID)
      )
      .valueChanges({ idField: 'threadID' })
      .subscribe((threads) => {
        this.currentThreads$.next(threads);
      });
  }

  getMessagesFromThreadID(threadID: string): void {
    this.threadSubscription = this.firestore
      .collection<Message>('messages', (ref) =>
        ref.where('threadID', '==', threadID)
      )
      .valueChanges({ idField: 'messageID' })
      .subscribe((messages) => {
        this.currentMessages$.next(messages);
      });
  }

  async getUserdataFromUserID(userID: string) {
    // userId is identical with Doc-Id
    let result = await firstValueFrom(
      this.userCollection.doc(userID).valueChanges()
    );
    return result;
  }

  setCurrentChannelFromChannel(channel: Channel) {
    this.currentChannel$.next(
      new CurrentChannel({
        type: 'channel',
        id: channel.channelID,
        name: channel.channelName,
        description: channel.channelDescription,
      })
    );
  }

  setCurrentChannelFromDirectChannel(directChannel: DirectChannel) {
    this.currentChannel$.next(
      new CurrentChannel({
        type: 'directChannel',
        id: directChannel.directChannelID,
        name: directChannel.directChannelName,
      })
    );
  }

  setDirectChannelProperties(dc: DirectChannel, currentUserID: string) {
    // dc = new DirectChannel(dc);
    console.log(dc);
    dc.directChannelName = this.users
      .filter(
        (user) =>
          dc.directChannelMembers.includes(user.uid) &&
          (user.uid != currentUserID || dc.directChannelMembers.length == 1)
      )
      .map((user) => user.displayName)
      .sort()
      .join(', ');
    dc.directChannelAvatar = this.users.filter(
      (user) => dc.directChannelMembers[0] == user.uid
    )[0].photoURL;
    return dc;
  }

  closeCurrentThread(removeFromLocalStorage: boolean, userID: string) {
    this.currentMessages$.next([]);
    this.currentThread$.next(null);
    if (removeFromLocalStorage){ 
      let storageSession = this.getUserSessionFromLocalStorage(userID)
      this.setUserSessionInLocalStorage(userID, storageSession.channel.channelID, storageSession.channel.type, null);
  }}

  addChannel(channel: any) {
    this.channelCollection.add(channel);
  }

  saveEditedChannel(channel: any) {
    this.channelCollection.doc(channel.channelID).set(channel);
  }

  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }

  saveDirectChannel(directChannel: any) {
    this.directChannelCollection.doc().set(directChannel);
  }

  saveDocWithCustomID(collection: string, obj: any, id: string) {
    return new Promise((resolve, reject) => {
      const collectionRef = this.firestore.collection(collection);
      collectionRef.doc(id).set(obj);
      resolve('document added to DB');
      (err: any) => reject(err);
    });
  }

  saveThread(thread: any) {
    return new Promise((resolve, reject) => {
      this.threadsCollection.doc(thread.threadID).set(thread);
      resolve('thread added to DB');
      (err: any) => reject(err);
    });
  }

  saveMessage(message: any) {
    return new Promise((resolve, reject) => {
      this.messageCollection.doc(message.messageID).set(message);
      resolve('message added to DB');
      (err: any) => reject(err);
    });
  }

  updateMessage(message: any) {
    console.log('updateMessage', message);
    return new Promise((resolve, reject) => {
      this.messageCollection.doc(message.messageID).update(message);
      resolve('edited message added to DB');
      (err: any) => reject(err);
    });
  }

  updateUserProperties(id: string, json: any) {
    this.userCollection.doc(id).update(json);
  }

  updateDirectChannel(id: string, json: any) {
    this.directChannelCollection.doc(id).update(json);
  }

  // ############  DELETE FUNCTIONS #############

  deleteChannel(channelID: string) {
    this.deleteThreadsInChannel(channelID);
    this.deleteMessagesInChannel(channelID);
    this.channelCollection.doc(channelID).delete();
  }

  deleteThreadsInChannel(channelID: string) {
    this.firestore
      .collection<Thread>('threads', (ref) =>
        ref.where('channelID', '==', channelID)
      )
      .valueChanges()
      .subscribe((threads) => {
        threads.forEach((thread) => this.deleteThread(thread.threadID));
      });
  }

  deleteMessagesInChannel(channelID: string) {
    this.firestore
      .collection<Message>('messages', (ref) =>
        ref.where('channelID', '==', channelID)
      )
      .valueChanges()
      .subscribe((messages) => {
        messages.forEach((message) => this.deleteMessage(message.messageID));
      });
  }

  deleteMessage(messageID: string) {
    console.log('deleting message ', messageID);
    this.messageCollection.doc(messageID).delete();
  }

  deleteThread(threadID: string) {
    console.log('deleting thread ', threadID);
    this.threadsCollection.doc(threadID).delete();
  }

  deleteThreadSubscription() {
    if (this.threadSubscription) this.threadSubscription.unsubscribe();
    else return;
  }

  deleteUser(id: string) {
    this.userCollection.doc(id).delete();
  }

  deleteDirectChannel(directChannelID: string) {
    console.log('deleting directChannel');
    this.directChannelCollection.doc(directChannelID).delete();
  }

  /**
   * if User is the only member in direct channel, the channel (TODO: and all its threads and messages) is deleted
   * if User is one of several members, userID is deleted from member list
   * @param userID
   */
  deleteUserFromDirectChannels(userID: string) {
    this.directChannels.forEach((dc) => {
      if (dc.directChannelMembers.includes(userID)) {
        if (dc.directChannelMembers.length == 1) {
          this.deleteDirectChannel(dc.directChannelID);
          this.deleteThreadsInChannel(dc.directChannelID);
          this.deleteMessagesInChannel(dc.directChannelID);
        } else {
          //TODO: delete user from member list and update dc in firestore
          dc.directChannelMembers.splice(dc.directChannelMembers.indexOf(userID), 1);
          this.updateDirectChannel(dc.directChannelID, { directChannelMembers: dc.directChannelMembers });
        }
      }
    });
  }

  // #############  LOCAL STORAGE  #############

  setUserSessionInLocalStorage(
    userID: string,
    channelID: string,
    channelType: string,
    threadID: string
  ) {
    const sessionData = {
      userID: userID,
      channel: { channelID: channelID, type: channelType },
      threadID: threadID,
    };
    localStorage.setItem(`session-${userID}`, JSON.stringify(sessionData));
  }

  getUserSessionFromLocalStorage(userID: string) {
    const sessionData = localStorage.getItem(`session-${userID}`);
    console.log(sessionData);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  removeUserSessionFromLocalStorage(userID: string) {
    localStorage.removeItem(`session-${userID}`);
  }
}