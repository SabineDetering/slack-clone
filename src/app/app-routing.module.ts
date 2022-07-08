import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { LoggedInGuard } from 'ngx-auth-firebaseui';
import { PrivacyNoticeComponent } from './privacy-notice/privacy-notice.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'channel', component: MainContainerComponent, canActivate: [LoggedInGuard], },
  { path: 'privacy-notice', component: PrivacyNoticeComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
