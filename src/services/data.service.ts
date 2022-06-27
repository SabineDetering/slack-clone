import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, firstValueFrom, map, Observable, Subscription } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { Thread } from 'src/models/thread.class';
import { Message } from 'src/models/message.class';
import { User } from 'src/models/user.class';
import { CurrentChannel } from 'src/models/current-channel.class';
import { stringify } from 'querystring';

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

  // public currentChannel$: BehaviorSubject<any> = new BehaviorSubject(
  //   new Channel()
  // );
  public currentThread$: BehaviorSubject<any> = new BehaviorSubject(null);

  private users: User[];

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
    this.subscribeToUsers()
  }

  subscribeToUsers(){
    this.users$.subscribe(users => this.users = users);
  }

  async getChannelFromChannelID(channelID: string) {
    return (await firstValueFrom(
      this.channelCollection.doc(channelID).valueChanges({ idField: 'channelID' })
    )) as Channel;
  }

  async getChannelFromDirectChannelID(channelID: string) {
    return (await firstValueFrom(
      this.directChannelCollection.doc(channelID).valueChanges({ idField: 'directChannelID' })
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

  setDirectChannelProperties(dc: DirectChannel, currentUserID: string){
    dc = new DirectChannel(dc);
    dc.directChannelName = this.users
      .filter(user => dc.directChannelMembers.includes(user.uid) && user.uid != currentUserID)
      .map(user => user.displayName ? user.displayName : 'Guest')
      .sort()
      .join(', ');
    dc.directChannelAvatar = this.users
      .filter(user => dc.directChannelMembers
        .find(member => member != currentUserID) == user.uid)[0]
      .photoURL;
    return dc;
  }

  deleteThreadSubscription(){
    this.threadSubscription.unsubscribe();
  }

  addChannel(channel: any) {
    this.channelCollection.add(channel);
  }

  saveEditedChannel(channel: any) {
    this.channelCollection.doc(channel.channelID).set(channel);
  }

  deleteChannel(channelID: string) {
    this.channelCollection.doc(channelID).delete();
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

  deleteMessage(messageID: string) {
    console.log('deleting message');
    this.messageCollection.doc(messageID).delete();
  }

  deleteThread(threadID: string) {
    console.log('deleting thread');
    this.threadsCollection.doc(threadID).delete();
  }


  updateUserProperties(id: string, json: any) {
    this.userCollection.doc(id).update(json);
  }


  deleteUser(id: string) {
    this.userCollection.doc(id).delete();    
  }

  // #############  LOCAL STORAGE  #############

  setCurrentChannelInLocalStorage(currentChannel: any) {
    console.log(currentChannel);
    localStorage.setItem('currentChannel', JSON.stringify(currentChannel));
  }

  getCurrentChannelFromLocalStorage() {
    const storageChannel = localStorage.getItem('currentChannel');
    return storageChannel ? JSON.parse(storageChannel) : null;
  }

  setCurrentThreadInLocalStorage(currentThreadID: string) {
    localStorage.setItem('currentThread', JSON.stringify(currentThreadID));
  }

  getCurrentThreadFromLocalStorage() {
    const storageThread = localStorage.getItem('currentThread');
    return storageThread ? JSON.parse(storageThread) : null;
  }

  removeCurrentChannelFromLocalStorage() {
    localStorage.removeItem('currentChannel');
  }

  removeCurrentThreadFromLocalStorage() {
    localStorage.removeItem('currentThread');
  }
}
