import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DirectMsg } from 'src/models/directMsg.class';
import { Thread } from 'src/models/thread.class';
import { Message } from 'src/models/message.class';
import { User } from 'src/models/user.class';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private channelCollection: AngularFirestoreCollection<Channel>;
  public channels$: Observable<Channel[]>;

  private userCollection: AngularFirestoreCollection<User>;
  public users$: Observable<User[]>;

  private directMsgCollection: AngularFirestoreCollection<DirectMsg>;
  public directMsg$: Observable<DirectMsg[]>;

  public threads$: Observable<Thread[]>;  // all threads in a channel
  private messageCollection: AngularFirestoreCollection<Message>;


  public currentChannel$: BehaviorSubject<any> = new BehaviorSubject(
    new Channel()
  );

  constructor(private readonly firestore: AngularFirestore) {
    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({
      idField: 'channelID',
    });

    this.userCollection = this.firestore.collection<User>('users');
    this.users$ = this.userCollection.valueChanges({ idField: 'userID' });

    this.directMsgCollection =
      this.firestore.collection<DirectMsg>('directMsg');
    this.directMsg$ = this.directMsgCollection.valueChanges({
      idField: 'directMsgID',
    });
  }


  getThreadsFromChannelID(channelID: string) {
    this.threads$ = this.firestore
      .collection<Thread>('threads', (ref) =>
        ref.where('channelID', '==', channelID)
      )
      .valueChanges({ idField: 'threadID' });
  }

  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }

  saveDirectMsg(directMsg: any) {
    this.directMsgCollection.doc().set(directMsg);
  }

  saveMessage(message: any) {
    this.messageCollection.doc().set(message);
  }
}
