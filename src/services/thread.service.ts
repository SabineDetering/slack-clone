import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  constructor(private Data: DataService, private storage: LocalStorageService) { }


  closeCurrentThread(removeFromLocalStorage: boolean, userID: string) {
    console.log('closeCurrentThread');
    this.Data.currentMessages$.next([]);
    this.Data.currentThread$.next(null);
    this.deleteThreadSubscription();
    if (removeFromLocalStorage) {
      this.removeThreadFromLocalStorage(userID)
    }
  }

  deleteThreadSubscription() {
    console.log('deleteThreadSubscription');
    if (this.Data.threadSubscription) {
      this.Data.threadSubscription.unsubscribe();
      console.log(this.Data.threadSubscription);
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
