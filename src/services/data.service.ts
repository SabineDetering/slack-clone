import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DirectChannel } from 'src/models/direct-channel.class';
import { ThreadMsg } from 'src/models/threadMsg.class';
import { User } from 'src/models/user.class';


@Injectable({
  providedIn: 'root'
})
export class DataService {


  private channelCollection: AngularFirestoreCollection<Channel>;
  public channels$: Observable<Channel[]>;

  private userCollection: AngularFirestoreCollection<User>;
  public users$: Observable<User[]>;

  private directChannelCollection: AngularFirestoreCollection<DirectChannel>;
  public directChannels$: Observable<DirectChannel[]>;

  private threadMsgCollection: AngularFirestoreCollection<ThreadMsg>;
  public threadMsg$: Observable<ThreadMsg[]>;

  public currentChannel$: BehaviorSubject<any> = new BehaviorSubject(new Channel());
  public currentDirectChannel$: BehaviorSubject<DirectChannel> = new BehaviorSubject(new DirectChannel());


  constructor(private readonly firestore: AngularFirestore) {

    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({ idField: 'channelID' });

    this.userCollection = this.firestore.collection<User>('users');
    this.users$ = this.userCollection.valueChanges({ idField: 'userID' });

    this.directChannelCollection = this.firestore.collection<DirectChannel>('direct-channels');
    this.directChannels$ = this.directChannelCollection.valueChanges({ idField: 'directChannelID' });
   
    this.threadMsgCollection = this.firestore.collection<ThreadMsg>('threads');
    // this.threadMsg$ = this.threadMsgCollection.valueChanges({ idField: 'threadMsgID' });
  }


  getThreadMsgs(channelID: string) {
    this.threadMsg$ = this.firestore.collection<ThreadMsg>('threadMsg', ref => ref.where('channelID', '==', channelID)).valueChanges({ idField: 'threadMsgID' });
  }

  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }

  saveDirectChannel(directChannel: any) {
    this.directChannelCollection.doc().set(directChannel);
  }

  saveThreadMsg(thread: any) {
    this.threadMsgCollection.doc().set(thread);
  }


}

