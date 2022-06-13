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
import { ThisReceiver } from '@angular/compiler';

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

  private messageCollection: AngularFirestoreCollection<Message>;

  public currentChannel$: BehaviorSubject<any> = new BehaviorSubject(
    new Channel()
  );
  public currentDirectChannel$: BehaviorSubject<DirectChannel> =
    new BehaviorSubject(new DirectChannel());


  constructor(private readonly firestore: AngularFirestore) {
    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({
      idField: 'channelID',
    });

    this.userCollection = this.firestore.collection<User>('users');
    this.users$ = this.userCollection.valueChanges({ idField: 'userID' });

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

  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }

  saveDirectChannel(directChannel: any) {
    this.directChannelCollection.doc().set(directChannel);
  }

  saveMessage(message: any) {
    this.messageCollection = this.firestore.collection<Message>('messages');
    this.messageCollection.doc().set(message);
  }

  saveThread(thread: any) {
    this.threadsCollection = this.firestore.collection<Thread>('threads');
    this.threadsCollection.doc().set(thread);
  }
}
