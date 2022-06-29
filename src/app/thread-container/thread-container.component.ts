import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { DataService } from 'src/services/data.service';
import { ThreadService } from 'src/services/thread.service';

@Component({
  selector: 'app-thread-container',
  templateUrl: './thread-container.component.html',
  styleUrls: ['./thread-container.component.scss'],
})
export class ThreadContainerComponent implements OnInit {
  constructor(
    public Data: DataService,
    private Auth: AuthService,
    private ts: ThreadService
  ) {}

  ngOnInit(): void {}

  closeThreadContainer() {
    this.ts.closeCurrentThread(true, this.Auth.currentUserId);
  }

  trackByIndex(index: any) {
    return index;
  }
}
