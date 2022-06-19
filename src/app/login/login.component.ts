import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthProvider, NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
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

  constructor(private router:Router,private Data:DataService,private Auth:AuthService) { }

  ngOnInit(): void {
  }

  printUser(event:Event) {
    console.log(event);
    // this.router.navigate(['/channel/78Zf74HHoirDyWMc3ihh']);
    // this.Data.currentChannel$.next(new CurrentChannel({type:'channel',name:'news',id:'78Zf74HHoirDyWMc3ihh'}));
  }

  printError(event:Event) {
    console.error(event);
  }
}
