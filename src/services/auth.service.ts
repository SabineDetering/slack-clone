import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { deleteUser, getAuth } from 'firebase/auth';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState = null;
  user: any;


  constructor(
    public af: AngularFireAuth,
    private router: Router,
    private Data: DataService
  ) {
    af.authState.subscribe(auth => {
      console.log(auth)
      this.authState = auth;
      if(auth) {
        this.af.onAuthStateChanged(user => {
          console.log('getUserChange')
          console.log(this.currentUserId)
          console.log(this.user)
          console.log(user)
          if (user) {//login
            this.user = user;
            if (user.isAnonymous) {
              this.setStandardAvatarAndGuestName(user.uid, 'guest');
            } else if (this.currentUser.photoURL) {
              this.setStandardAvatarAndGuestName(user.uid, 'avatar');
            }
            this.router.navigate(['/channel']);
          } else { //logout
            console.log('logged out user', this.user);
            if (this.user.isAnonymous) {
              this.deleteAnonymousUser(this.user);
            }
            this.user = null;
            this.router.navigate(['/login']);
            this.closeThreadContainer();
          }
        })
      }
      console.log('currentUser', this.currentUser);
    });
  }

  setStandardAvatarAndGuestName(id: string, type: string) {
    if (type == 'avatar') {// registered user without avatar
      this.updateProperties({ photoURL: 'assets/img/avatar-neutral.png' });
      this.Data.updateUserProperties(id, {
        photoURL: 'assets/img/avatar-neutral.png'
      });
    } else {//anonymous user
      this.updateProperties({ displayName: 'Guest', photoURL: 'assets/img/avatar-neutral.png' });
      this.Data.updateUserProperties(id, {
        displayName: 'Guest', photoURL: 'assets/img/avatar-neutral.png'
      });
    }
  }

  
  closeThreadContainer() {
    this.Data.closeCurrentThread(false);
    this.Data.deleteThreadSubscription();
  }


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
    (await this.af.currentUser).updateProfile(json)
  }


  /**
   * deletes anonymous users from authentication and firestore collections after logout   * 
   * @param user  - user to be deleted
   */
  async deleteAnonymousUser(user) {
    console.log(user)
    //delete user from firebase authentication
    deleteUser(user).then(() => {
      console.log('is deleted from auth', user);
    }).catch((error) => {
      console.log('error deleting anonymous user: ', error);
    });
    //delete user from firebase collections
    //TODO: delete corresponding direct channels, threads, messages
    this.Data.deleteUser(user.uid);
    this.Data.removeUserSessionFromLocalStorage(user.uid)
    this.Data.deleteUserFromDirectChannels(user.uid);
  }
}
