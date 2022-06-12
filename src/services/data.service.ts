import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { DirectMsg } from 'src/models/directMsg.class';
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

  private directMsgCollection: AngularFirestoreCollection<DirectMsg>;
  public directMsg$: Observable<DirectMsg[]>;

  private threadMsgCollection: AngularFirestoreCollection<ThreadMsg>;
  public threadMsg$: Observable<ThreadMsg[]>;

  public currentChannel: Channel = new Channel();


  constructor(private readonly firestore: AngularFirestore) {

    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({ idField: 'channelID' });

    this.userCollection = this.firestore.collection<User>('users');
    this.users$ = this.userCollection.valueChanges({ idField: 'userID' });

    this.directMsgCollection = this.firestore.collection<DirectMsg>('directMsg');
    this.directMsg$ = this.directMsgCollection.valueChanges({ idField: 'directMsgID' });
   
    this.threadMsgCollection = this.firestore.collection<ThreadMsg>('threadMsg');
    this.threadMsg$ = this.threadMsgCollection.valueChanges({ idField: 'threadMsgID' });
  }


  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }

  saveDirectMsg(directMsg: any) {
    this.directMsgCollection.doc().set(directMsg);
  }

  saveThreadMsg(threadMsg: any) {
    this.threadMsgCollection.doc().set(threadMsg);
  }


}

