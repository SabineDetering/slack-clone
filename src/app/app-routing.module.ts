import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainContainerComponent } from './main-container/main-container.component';

const routes: Routes = [
  { path: '', component: MainContainerComponent },  // change later to Login
  { path: 'channel/:channelID', component: MainContainerComponent },
  { path: 'direct-msg/:directMsgID', component: MainContainerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
