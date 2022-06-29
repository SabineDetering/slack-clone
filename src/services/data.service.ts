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
  public currentMessages!: Message[];
  private messageCollection: AngularFirestoreCollection<Message>;

  public currentChannel$: BehaviorSubject<CurrentChannel> = new BehaviorSubject(
    null
  );
  public currentChannel!: CurrentChannel;

  public currentThread$: BehaviorSubject<any> = new BehaviorSubject(null);
  public currentThread!: Thread;

  public users: User[];
  public directChannels: DirectChannel[];

  public channelSubscription!: Subscription;
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
    this.subscribeToCurrentChannel();
    this.subscribeToCurrentThread();
    this.subscribeToCurrentMessages();
  }

  subscribeToUsers() {
    this.users$.subscribe((users) => (this.users = users));
  }

  subscribeToDirectChannels() {
    this.directChannels$.subscribe((dc) => (this.directChannels = dc));
  }

  subscribeToCurrentChannel() {
    this.currentChannel$.subscribe((channel) => {
      this.currentChannel = channel;
    });
  }

  subscribeToCurrentThread() {
    this.currentThread$.subscribe((thread) => {
      this.currentThread = thread;
    });
  }

  subscribeToCurrentMessages() {
    this.currentMessages$.subscribe((messages) => {
      this.currentMessages = messages;
    });
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
    this.channelSubscription = this.firestore
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

  closeCurrentThread(removeFromLocalStorage: boolean, userID: string) {
    console.log('closeCurrentThread');
    this.currentMessages$.next([]);
    this.currentThread$.next(null);
    this.deleteThreadSubscription();
    if (removeFromLocalStorage) {
      let storageSession = this.getUserSessionFromLocalStorage(userID);
      this.setUserSessionInLocalStorage(
        userID,
        storageSession.channel.channelID,
        storageSession.channel.type,
        null
      );
    }
  }

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

  saveThread(thread: any) {
    console.log('save thread ', thread.threadID)
    return new Promise((resolve, reject) => {
      this.threadsCollection.doc(thread.threadID).set(thread);
      resolve('thread added to DB');
      (err: any) => reject(err);
    });
  }
  
  saveMessage(message: any) {
    console.log('save message ', message.messageID)
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
    console.log('deleteThreadSubscription');
    if (this.threadSubscription) {
      this.threadSubscription.unsubscribe();
      console.log(this.threadSubscription);
    } else return;
  }

  deleteUser(id: string) {
    this.userCollection.doc(id).delete();
  }

  deleteDirectChannel(directChannelID: string) {
    console.log('deleting directChannel');
    this.directChannelCollection.doc(directChannelID).delete();
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
    return sessionData ? JSON.parse(sessionData) : null;
  }

  removeUserSessionFromLocalStorage(userID: string) {
    localStorage.removeItem(`session-${userID}`);
  }
}
