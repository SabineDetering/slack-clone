import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mobileQueryWithThread: MediaQueryList;
  mobileQueryWithoutThread: MediaQueryList;
  userLinks: LinkMenuItem[];
  currentMessages: Message[];
  touchScreen: boolean;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @ViewChild('sidenav') sidenav: MatSidenav;

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
    this.mobileQueryWithThread = media.matchMedia('(max-width: 1000px)');
    this.mobileQueryWithoutThread = media.matchMedia('(max-width: 870px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQueryWithThread.addEventListener('change', this._mobileQueryListener);
    this.mobileQueryWithoutThread.addEventListener('change', this._mobileQueryListener);

    //check if screen is touch screen (no hover effects)
    this.touchScreen = media.matchMedia('(hover:none)').matches;
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, action ? null : { duration: 3000 });
  }


  openAvatarDialog() {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent);
  }


  openEditProfileDialog() {
    const dialogRef = this.dialog.open(DialogEditProfileComponent);
  }


  /**
   * user is deleted after confirmation
   */
  deleteAccount() {
    const confirmationRef = this.dialog.open(DialogConfirmationComponent, {
      maxWidth: 500,
      data: {
        title: 'Delete account of ' + this.Auth.currentUser.currentUser.displayName,
        text: "This will completely delete your account and can't be undone. Any messages you have posted in channels or direct channels will still be visible but without your name as author.",
        question: "Do you really want to proceed?",
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


  /**
   * delete user from authentication,firebase and local storage
   */
  async deleteUser() {
    const userToDelete = this.Auth.currentUser.currentUser;
    const result = await this.Auth.deleteUserFromAuth(userToDelete);
    console.log('result');
    console.log(result);
    if (result == 'success') {
      //delete user from firebase collections
      this.cs.deleteUserFromDirectChannels(userToDelete.uid);
      this.Data.deleteUser(userToDelete.uid);
      //delete user session from local storage
      this.storage.removeUserSessionFromLocalStorage(userToDelete.uid);
      this.openSnackBar('Your account has been deleted.');
    } else if (result == "FirebaseError: Firebase: This operation is sensitive and requires recent authentication. Log in again before retrying this request. (auth/requires-recent-login).") {
      this.openSnackBar("Timeout-Error! You have to re-login to verify your account. Please log out (via click on the menu-avatar), then log in again to finalize the deletion.", 'Ok');
    } else {
      this.openSnackBar("Your account couldn't be deleted." + result, 'Ok');
    }
    this.router.navigate(['/login']);
  }


  /**
   * signout of currentUser
   * anonymous users are deleted from authentication, firestore and local storage
   */
  async logout() {
    this.Auth.showLoadingSpinner = true;
    const user = this.Auth.currentUser.currentUser;
    console.log('logged out user', user);
    await this.closeSession();
    if (user.isAnonymous) {
      this.cs.deleteUserFromDirectChannels(user.uid);
      try {
        await this.Data.deleteUser(user.uid);
      } catch (err) {
        console.log(err)
      }
      this.Auth.deleteUserFromAuth(user);
      this.storage.removeUserSessionFromLocalStorage(user.uid);
      console.log('user deleted')
    }
    await this.Auth.af.signOut();
    this.router.navigate(['/login']);
    this.sidenav.close();
  }


  /**
   * empties BehaviorSubjects and deletes subscriptions
   * @returns Promise
   */
  closeSession() {
    console.log('close session')
    return new Promise((resolve, reject) => {
      this.ts.closeCurrentThread();
      this.cs.closeCurrentChannel();
      resolve('session closed')
      reject((err: any) => reject(err))
    })
  }
}
