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

  constructor(
    public af: AngularFireAuth,
    private router: Router,
    private Data: DataService
  ) {
    af.authState.subscribe(auth => {
      this.authState = auth;
      console.log('currentUser', this.currentUser);
    });
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
    //delete user from firebase authentication
    deleteUser(user).then(() => {
      console.log('is deleted from auth', user);
    }).catch((error) => {
      console.log('error deleting anonymous user: ', error);
    });
    //delete user from firebase collections
    //TODO: delete corresponding direct channels, threads, messages
    this.Data.deleteUser(user.uid);
  }
}
