import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Message } from 'src/models/message.class';
import { DataService } from 'src/services/data.service';
import { LinkMenuItem } from 'ngx-auth-firebaseui';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from './dialog-change-avatar/dialog-change-avatar.component';
import { AuthService } from 'src/services/auth.service';
import { fromEvent, Observable, observable } from 'rxjs';
import { ThreadService } from 'src/services/thread.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogEditProfileComponent } from './dialog-edit-profile/dialog-edit-profile.component';
import { ChannelService } from 'src/services/channel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mobileQuery: MediaQueryList;
  userLinks: LinkMenuItem[];
  currentMessages: Message[];
  touchScreen: boolean;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    @Inject(MediaMatcher) media: MediaMatcher,
    public Data: DataService,
    public router: Router,
    public dialog: MatDialog,
    public Auth: AuthService,
    private ts: ThreadService,
    private cs:ChannelService
  ) {
    this.checkUserScreen(media, changeDetectorRef);
  }


  checkUserScreen(media: any, changeDetectorRef: any) {
    //check if screen width is too small for showing sidenav
    this.mobileQuery = media.matchMedia('(max-width: 870px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    //check if screen is touch screen (no hove effects)
    this.touchScreen = media.matchMedia('(hover:none)').matches;
  }


  openAvatarDialog() {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent);
  }


  openEditProfileDialog() {
    const dialogRef = this.dialog.open(DialogEditProfileComponent);
  }


  async logout() {
    console.log('logged out user', this.Auth.currentUser);
    if (this.Auth.currentUser.currentUser.isAnonymous) {
      this.Auth.deleteAnonymousUser(this.Auth.currentUser.currentUser);
    }
    await this.closeSession();
    this.Auth.af.signOut();
    this.router.navigate(['/login']);
  } 


  closeSession() {
    return new Promise((resolve, reject) => {
      this.ts.closeCurrentThread();
      this.cs.closeCurrentChannel();
      resolve('session closed')
      reject((err: any) => reject(err))
    })
  }
}
