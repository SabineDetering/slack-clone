import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';


import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';

import { ChannelListComponent } from './channel-list/channel-list.component';
import { ThreadContainerComponent } from './thread-container/thread-container.component';
import { DirectChannelListComponent } from './direct-channel-list/direct-channel-list.component';
import { DialogChannelComponent } from './dialog-channel/dialog-channel.component';
import { LoginComponent } from './login/login.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { InputboxComponent } from './inputbox/inputbox.component';
import { DialogAddDirectChannelComponent } from './dialog-add-direct-channel/dialog-add-direct-channel.component';
import { OrderByPipe } from 'src/pipes/order-by-pipe.pipe';
import { MessageComponent } from './message/message.component';
import { DialogConfirmationComponent } from './dialog-confirmation/dialog-confirmation.component';
import { MessageActionsComponent } from './message-actions/message-actions.component';

@NgModule({
  declarations: [
    AppComponent,
    ChannelListComponent,
    ThreadContainerComponent,
    DirectChannelListComponent,
    DialogChannelComponent,
    LoginComponent,
    MainContainerComponent,
    InputboxComponent,
    DialogAddDirectChannelComponent,
    OrderByPipe,
    MessageComponent,
    DialogConfirmationComponent,
    MessageActionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    AngularFireModule.initializeApp(environment.firebase),
    NoopAnimationsModule,
    FormsModule,
    NgxAuthFirebaseUIModule.forRoot(
      {
        apiKey: 'AIzaSyAUjkrn3_ViAa5mOqk02FMNczM-RgnQPjc',
        authDomain: 'slack-clone-asv.firebaseapp.com',
        databaseURL: 'https://slack-clone-asv-default-rtdb.europe-west1.firebasedatabase.app',
        projectId: 'slack-clone-asv',
        storageBucket: 'slack-clone-asv.appspot.com',
        messagingSenderId: '1021747445945'
      },
      () => 'slack_clone_factory',
      {
        enableFirestoreSync: true, // enable/disable autosync users with firestore
        toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
        toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
        authGuardFallbackURL: '/loggedout', // url for unauthenticated users - to use in combination with canActivate feature on a route
        authGuardLoggedInURL: '/loggedin', // url for authenticated users - to use in combination with canActivate feature on a route
        passwordMaxLength: 30, // `min/max` input parameters in components should be within this range.
        passwordMinLength: 6, // Password length min/max in forms independently of each componenet min/max.
        // Same as password but for the name
        nameMaxLength: 50,
        nameMinLength: 2,
        // If set, sign-in/up form is not available until email has been verified.
        // Plus protected routes are still protected even though user is connected.
        guardProtectedRoutesUntilEmailIsVerified: false,
        enableEmailVerification: false, // default: true
        useRawUserCredential: false, // If set to true outputs the UserCredential object instead of firebase.User after login and signup - Default: false
      }),

    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatListModule,
    MatSelectModule,
    MatMenuModule,
    LayoutModule

  ],
  providers: [
    OrderByPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
