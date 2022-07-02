import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-usermenu',
  templateUrl: './dialog-usermenu.component.html',
  styleUrls: ['./dialog-usermenu.component.scss']
})
export class DialogUsermenuComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogUsermenuComponent>) { }

  ngOnInit(): void {
  }

}
