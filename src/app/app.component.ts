import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Message } from 'src/models/message.class';
import { DataService } from 'src/services/data.service';
import { LinkMenuItem } from 'ngx-auth-firebaseui';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from './dialog-change-avatar/dialog-change-avatar.component';
import { AuthService } from 'src/services/auth.service';
import { ThreadService } from 'src/services/thread.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DialogEditProfileComponent } from './dialog-edit-profile/dialog-edit-profile.component';
import { ChannelService } from 'src/services/channel.service';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalStorageService } from 'src/services/local-storage.service';

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
    private cs: ChannelService,
    private _snackBar: MatSnackBar,
    private storage: LocalStorageService
  ) {
    this.checkUserScreen(media, changeDetectorRef);
  }


  checkUserScreen(media: any, changeDetectorRef: any) {
    //check if screen width is too small for showing sidenav
    this.mobileQuery = media.matchMedia('(max-width: 870px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    //check if screen is touch screen (no hover effects)
    this.touchScreen = media.matchMedia('(hover:none)').matches;
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  openAvatarDialog() {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent);
  }


  openEditProfileDialog() {
    const dialogRef = this.dialog.open(DialogEditProfileComponent);
  }


  deleteAccount() {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      data: {
        title: 'Delete account of ' + this.Auth.currentUser.currentUser.displayName,
        text: "This will completely delete your account and can't be undone. Any messages you have posted in channels or direct channels will still be visible but without your name as author. Do you really want to proceed?",
        discardText: 'No',
        confirmText: 'Yes',
      },
    });
    confirmationRef.afterClosed().subscribe((result) => {
      if (result == 'confirm') {
        this.deleteUser();
      } else {
        this.openSnackBar('Delete has been discarded.');
      }
    });
  }


  async deleteUser() {
    const userToDelete = this.Auth.currentUser.currentUser;
    if (userToDelete.isAnonymous) {
      this.Auth.deleteAnonymousUser(userToDelete);
    } else {
      this.storage.removeUserSessionFromLocalStorage(userToDelete.uid);
      this.cs.deleteUserFromDirectChannels(userToDelete.uid);
      const result = await this.Auth.deleteRegisteredUser(userToDelete);
      if (result == 'success') {
        this.openSnackBar('Your account has been deleted.');
      } else {
        this.openSnackBar("Your account couldn't be deleted.", result);
      }
    }
    this.router.navigate(['/login']);
  }


  async logout() {
    const user = this.Auth.currentUser
    console.log('logged out user', user);
    if (user.currentUser.isAnonymous) {
      this.storage.removeUserSessionFromLocalStorage(user.uid);
      this.cs.deleteUserFromDirectChannels(user.uid);
      this.Auth.deleteAnonymousUser(this.Auth.currentUser.currentUser);
    }
    await this.closeSession();
    await this.Auth.af.signOut();
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
