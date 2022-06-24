import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthProvider, NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { firstValueFrom } from 'rxjs';
import { CurrentChannel } from 'src/models/current-channel.class';
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
    // this.Auth.af.authState.subscribe(auth => {
    //   if (!!auth) { this.setStandardAvatarAndGuestName(); }
    // });
  }


  async getUser(event) {
    let user = await firstValueFrom(this.Auth.af.authState);
    console.log('user after await', user);
    console.log('auth.currentuser after await', this.Auth.currentUser);
    // if (!user.uid == null) {
      this.setStandardAvatarAndGuestName();
    // }
  }

  /**
   * 
   */
  setStandardAvatarAndGuestName() {
    console.log('entered function setStandardAvatarAndGuestName');
    console.log('auth.currentuser.displayName', this.Auth.currentUser.displayName);

    if (!!this.Auth.currentUser.displayName) {
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


     this.router.navigate(['/channel']);
     /* this.Data.currentChannel$.next(new CurrentChannel({type:'channel',name:'news',id:'78Zf74HHoirDyWMc3ihh'})); */
  
}

printError(event: Event) {
  console.error(event);
}
}
