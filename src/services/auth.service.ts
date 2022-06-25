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


  async logout() {
    //TODO: delete user from auth and firestore
    
    // if (!this.currentUser.email) { // anonymous user
    //   //delete user from firebase authentication
    //   console.log('before auth delete',this.currentUser);
    //   (await this.af.currentUser).delete();
    //   //delete user from firebase collections
    //   this.Data.deleteUser(this.currentUserId);
    // }
    this.router.navigate(['/login']);
  }
}
