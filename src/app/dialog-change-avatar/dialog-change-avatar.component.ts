import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-dialog-change-avatar',
  templateUrl: './dialog-change-avatar.component.html',
  styleUrls: ['./dialog-change-avatar.component.scss']
})
export class DialogChangeAvatarComponent implements OnInit {

  downloadURL: any;

  constructor(
    private dialogRef: MatDialogRef<DialogChangeAvatarComponent>,
    private Auth: AuthService,
    private Data:DataService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit(): void {
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'avatars/' + this.Auth.currentUserId;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    // observe percentage changes
    // this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(async () => {
        this.downloadURL = await firstValueFrom(fileRef.getDownloadURL());
        console.log('URL', this.downloadURL);        
      })
    )
      .subscribe({
        next: (data) => console.log("Next data: ", data),
        error: (err) => console.error("Error : ", err),
        complete: () => console.log("Complete")
      });

  }


  saveAvatar() {
    this.Auth.updateAvatar(this.downloadURL);
    this.Data.updateUserProperties(this.Auth.currentUserId, {photoURL:this.downloadURL});    
  }

}
