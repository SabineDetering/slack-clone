import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Channel } from 'src/models/channel.class';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss']
})
export class DialogAddChannelComponent implements OnInit {

  public channel = new Channel();

  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelComponent>,
    private Data: DataService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }


  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }


  saveChannel() {
    this.Data.saveChannel(this.channel.toJSON());
    this.openSnackBar('New channel has been created.');
  }

}
