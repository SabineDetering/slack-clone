import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

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
    console.log('removeUserSessionFromLocalStorage')
    /* if(this.getUserSessionFromLocalStorage()) */
    localStorage.removeItem(`session-${userID}`);
  }
}
