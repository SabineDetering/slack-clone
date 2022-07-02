import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Message } from 'src/models/message.class';
import { DataService } from 'src/services/data.service';
import { LinkMenuItem } from 'ngx-auth-firebaseui';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogChangeAvatarComponent } from './dialog-change-avatar/dialog-change-avatar.component';
import { AuthService } from 'src/services/auth.service';
import { fromEvent, Observable, observable } from 'rxjs';
import { ThreadService } from 'src/services/thread.service';

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
  public userMenuOpen: boolean = false;

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    @Inject(MediaMatcher) media: MediaMatcher,
    public Data: DataService,
    public router: Router,
    public dialog: MatDialog,
    public Auth: AuthService
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
    this.listenClickEventsToCloseMenu();
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.listenClickEventsToCloseMenu();
    }
  }

  listenClickEventsToCloseMenu() {
    let source = fromEvent(document, 'click');
    source.subscribe((event: Event | any) => {
      if (event.target.id !== 'userMenu') {
        this.userMenuOpen = false;
      }
    });
  }

  openAvatarDialog() {
    const dialogRef = this.dialog.open(DialogChangeAvatarComponent);
  }
}
