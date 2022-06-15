import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { ThreadContainerComponent } from './thread-container/thread-container.component';

const routes: Routes = [
  { path: '', component: MainContainerComponent },  // change later to Login
  { path: 'channel/:channelID', component: MainContainerComponent },
  { path: 'direct-channel/:directChannelID', component: MainContainerComponent },
  { path: 'channel/:channelID/thread/:threadID', component: ThreadContainerComponent, outlet: 'thread' },
  { path: 'direct-channel/:directChannelID/thread/:threadID', component: ThreadContainerComponent, outlet: 'thread' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
