import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { deleteUser } from 'firebase/auth';
import { DataService } from './data.service';
import { ChannelService } from './channel.service';
import { ThreadService } from './thread.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState = null;
  user: any;

  constructor(
    public af: AngularFireAuth,
    private router: Router,
    private Data: DataService,
    private cs: ChannelService,
    private ts: ThreadService,
    private storage: LocalStorageService
  ) {
    af.authState.subscribe((auth) => {
      this.authState = auth;
    })
  }
  // if (auth) {
  //   this.af.onAuthStateChanged( async (user) => {
  //     if (user) {
  //       //login
  //       this.user = user;
  //       this.router.navigate(['/channel']);
  //     }
  // else {
  //   //logout
  //   console.log('logged out user', this.user);
  //   if (this.user.isAnonymous) {
  //     this.deleteAnonymousUser(this.user);
  //   }
  //   this.user = null;
  //   await this.closeSession()
  //   this.router.navigate(['/login']);
  // }
  //       });
  //     }
  //     console.log('currentUser', this.currentUser);
  //   });
  // }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get currentUser(): any {
    return this.authenticated ? this.authState.auth : null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  async updateProperties(json: any) {
    (await this.af.currentUser).updateProfile(json);
  }

  closeSession() {
    return new Promise((resolve, reject) => {
      this.ts.closeCurrentThread();
      this.cs.closeCurrentChannel()
      resolve('session closed')
      reject((err: any) => reject(err))
    })
  }

  /**
   * deletes anonymous users from authentication and firestore collections after logout   *
   * @param user  - user to be deleted
   */
  async deleteAnonymousUser(user) {
    console.log(user);
    //delete user from firebase authentication
    deleteUser(user)
      .then(() => {
        console.log('is deleted from auth', user);
      })
      .catch((error) => {
        console.log('error deleting anonymous user: ', error);
      });
    //delete user from firebase collections
    this.Data.deleteUser(user.uid);
    this.storage.removeUserSessionFromLocalStorage(user.uid);
    this.cs.deleteUserFromDirectChannels(user.uid);
  }


  /**
   * deletes registered user from authentication and firestore collections 
   * @param user  - user to be deleted
   * @returns - string to indicate success or error
   */
  async deleteRegisteredUser(user): Promise<string> {
    console.log(user);
    let result = '';
    //delete user from firebase authentication
    await deleteUser(user)
      .then(() => {
        console.log('is deleted from auth', user);
        //delete user from firebase collections
        this.Data.deleteUser(user.uid);
        this.storage.removeUserSessionFromLocalStorage(user.uid);
        this.cs.deleteUserFromDirectChannels(user.uid);
        result = 'success';
      })
      .catch((error) => {
        console.log('error deleting registered user: ', error);
        result = error;
      });
    return result;
  }
}
