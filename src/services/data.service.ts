import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
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

  public currentChannel$: BehaviorSubject<CurrentChannel> = new BehaviorSubject(null);

  // public currentChannel$: BehaviorSubject<any> = new BehaviorSubject(
  //   new Channel()
  // );
  public currentThread$: BehaviorSubject<any> = new BehaviorSubject(null);
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

    this.directChannelCollection =
      this.firestore.collection<DirectChannel>('direct-channels');

    this.directChannels$ = this.directChannelCollection.valueChanges({
      idField: 'directChannelID',
    });
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
    console.log(threadID)
    this.firestore
      .collection<Message>('messages', (ref) =>
        ref.where('threadID', '==', threadID)
      )
      .valueChanges({ idField: 'messageID' })
      .subscribe((messages) => {
        console.log(messages)
        this.currentMessages$.next(messages);
      });
  }

  async getMessageFromMessageId(messageId: string) {
    return await firstValueFrom(
      this.messageCollection.doc(messageId).valueChanges()
    ) as Message;
  }

  async getUserdataFromUserID(userID: string) {  // userId is identical with Doc-Id
    let result =  await firstValueFrom(
      this.userCollection.doc(userID).valueChanges()
    ) 
    return result;
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
/* 
  saveMessage(message: any) {
    this.messageCollection = this.firestore.collection<Message>('messages');
    this.messageCollection.doc().set(message);
  }

  saveThread(thread: any) {
    this.threadsCollection = this.firestore.collection<Thread>('threads');
    this.threadsCollection.doc(thread.threadID).set(thread); // set ID for firebase
  } */

  saveDocWithCustomID(collection: string, obj: any, id: string){    
    return new Promise((resolve, reject) => {
    const collectionRef = this.firestore.collection(collection);
    collectionRef.doc(id).set(obj)
    resolve('document added to DB');
    (err: any) => reject(err)
    })
  }

/*   async addMessage(message: any) {
    let messageId;
    await this.messageCollection
      .add(message)
      .then((docRef) => (messageId = docRef.id));
    return messageId;
  } */
}
