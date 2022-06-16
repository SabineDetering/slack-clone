import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { ThreadContainerComponent } from './thread-container/thread-container.component';

const routes: Routes = [
  { path: '', component: MainContainerComponent },  // change later to Login
  { path: 'channel/:channelID', component: MainContainerComponent },
  { path: 'direct-channel/:directChannelID', component: MainContainerComponent },
  { path: 'thread/:threadID', component: ThreadContainerComponent, outlet: 'thread' },
  { path: 'thread/:threadID', component: ThreadContainerComponent, outlet: 'thread' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
