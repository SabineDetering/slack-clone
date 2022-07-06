import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { deleteUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState = null;
  user: any;
  showLoadingSpinner = false;

  constructor(
    public af: AngularFireAuth
  ) {
    af.authState.subscribe((auth) => {
      this.authState = auth;
    })
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
    (await this.af.currentUser).updateProfile(json);
  }


  /**
   * deletes registered user from authentication 
   * @param user  - user to be deleted
   * @returns - string to indicate success or error
   */
  async deleteUserFromAuth(user): Promise<string> {
    console.log(user);
    let result = '';
    await deleteUser(user)
      .then(() => {
        console.log('is deleted from auth', user);
        result = 'success';
      })
      .catch((error) => {
        console.log('error deleting registered user: ', error);
        result = error;
      });
    return result;
  }
}
