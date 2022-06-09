import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Channel } from 'src/models/channel.class';


@Injectable({
  providedIn: 'root'
})
export class DataService {


  private channelCollection: AngularFirestoreCollection<Channel>;
  public channels$: Observable<Channel[]>;


  constructor(private readonly firestore: AngularFirestore) {
    this.channelCollection = this.firestore.collection<Channel>('channels');
    this.channels$ = this.channelCollection.valueChanges({ idField: 'channelID' });
  }


  saveChannel(channel: any) {
    this.channelCollection.doc().set(channel);
  }


}

