import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/models/message.class';
import { Thread } from 'src/models/thread.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input()currenThread: Thread;
  message: Message = new Message();

  constructor(public Data: DataService) {
  }
    
  ngOnInit(): void {
    console.log('currentThread',this.currenThread);
  }


}
