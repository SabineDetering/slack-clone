import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  providers = AuthProvider;
  user: any;

  constructor(
    private router: Router,
    private Data: DataService,
    private Auth: AuthService
  ) {}


  /**
   * when loggedin user is available on Auth and on firestore
   * anonymous users get name and standard avatar and
   * new users get standard avatar
   */
  async ngOnInit(): Promise<void> {
    this.hideLoadingSpinner()
    let userSubscription = this.Data.users$.subscribe((users) => {
      const user = users.filter(user => user.uid == this.Auth.currentUserId)[0];
      console.log('onInit user', user);
      if (user) {//currentUser exists on Auth and on firestore  
        console.log('user exists');
        if (!!this.Auth.currentUser.currentUser) {
          if (this.Auth.currentUser.currentUser.isAnonymous) {
            this.setStandardAvatarAndGuestName(this.Auth.currentUser.currentUser.uid, 'guest');
          } else if (!this.Auth.currentUser.currentUser.photoURL) {
            this.setStandardAvatarAndGuestName(this.Auth.currentUser.currentUser.uid, 'avatar');
          }
        }
        userSubscription.unsubscribe();
        this.router.navigate(['/channel']);
      }
    });
  }

  hideLoadingSpinner(){
    setTimeout(() => {
      this.Auth.showLoadingSpinner = false;
    }, 100);
  }


  printSuccess(event: any) {
    this.Auth.showLoadingSpinner = true;
    console.log('login event', event);
    console.log('login event', event.user.uid);
  }


  printError(event: Event) {
    console.error(event);
  }


  /**
   * sets avatar to standard avatar
   * and additionally for anonymous users displayName is set to 'Guest'
   */
  setStandardAvatarAndGuestName(id: string, type: string) {
    if (type == 'avatar') {
      // registered user without avatar
      this.Auth.updateProperties({ photoURL: 'assets/img/avatar-neutral-light-grey.png' });
      this.Data.updateUserProperties(id, {
        photoURL: 'assets/img/avatar-neutral-light-grey.png',
      });
    } else {
      //anonymous user
      this.Auth.updateProperties({
        displayName: 'Guest',
        photoURL: 'assets/img/avatar-neutral-light-grey.png',
      });
      this.Data.updateUserProperties(id, {
        displayName: 'Guest',
        photoURL: 'assets/img/avatar-neutral-light-grey.png',
      });
    }
  }

}
