import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';
import { Thread } from 'src/models/thread.class';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  constructor(private Data: DataService, private storage: LocalStorageService) { }

  updateAnswerAmountInThread(increase?: Boolean) {
    console.log('updateAnswerAmountInThread')
    let thread = new Thread(this.Data.currentThread);
    if(increase) thread.answerAmount++;
    else thread.answerAmount--;
    this.Data.saveThread(thread.toJSON());
    this.Data.currentThread$.next(thread);
  }

  closeCurrentThread(removeFromLocalStorage?: boolean, userID?: string) {
    console.log('closeCurrentThread');
    this.Data.currentMessages$.next([]);
    this.Data.currentThread$.next(null);
    this.deleteMessagesSubscription();
    if (removeFromLocalStorage) {
      this.removeThreadFromLocalStorage(userID)
    }
  }

  deleteMessagesSubscription() {
    console.log('deletemessagesSubscription');
    if (this.Data.messagesSubscription) {
      this.Data.messagesSubscription.unsubscribe();
      console.log(this.Data.messagesSubscription);
    } else return;
  }

  removeThreadFromLocalStorage(userID: string){
    let storageSession = this.storage.getUserSessionFromLocalStorage(userID);
      this.storage.setUserSessionInLocalStorage(
        userID,
        storageSession.channel.channelID,
        storageSession.channel.type,
        null
      );
  }
}
