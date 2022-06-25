import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  providers = AuthProvider;

  constructor(private router: Router, private Data: DataService, private Auth: AuthService) { }

  ngOnInit(): void {
  }


  async getUser(event) {
    console.log('login event', event);
    if (event.user.isAnonymous) {
      this.setStandardAvatarAndGuestName('guest');
    } else if (!event.user.photoURL) {
      this.setStandardAvatarAndGuestName('avatar');
    }
    this.router.navigate(['/channel']);
  }


  /**
   * sets avatar to standard avatar 
   * and additionally for anonymous users displayName is set to 'Guest'
   */
  setStandardAvatarAndGuestName(type: string) {
    if (type == 'avatar') {// registered user without avatar
      this.Auth.updateProperties({ photoURL: 'assets/img/avatar-neutral.png' });
      this.Data.updateUserProperties(this.Auth.currentUserId, {
        photoURL: 'assets/img/avatar-neutral.png'
      });
    } else {//anonymous user
      this.Auth.updateProperties({ displayName: 'Guest', photoURL: 'assets/img/avatar-neutral.png' });
      this.Data.updateUserProperties(this.Auth.currentUserId, {
        displayName: 'Guest', photoURL: 'assets/img/avatar-neutral.png'
      });
    }
  }


  printError(event: Event) {
    console.error(event);
  }

}
