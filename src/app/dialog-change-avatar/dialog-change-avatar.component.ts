import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/services/auth.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

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
      finalize(() => this.downloadURL = fileRef.getDownloadURL())
    )
      .subscribe()
  }



  saveAvatar() {

    this.Auth.updateProfilePic('avatars/' + this.Auth.currentUserId);
  //change only in auth database, not in firestore
  // this.dm.directChannelMembers.push(this.Auth.currentUserId);
  // console.log(this.dm);
  // this.Data.saveDirectChannel(this.dm.toJSON());
  // this.dialogRef.close('saved');
  // this.openSnackBar('New chat has been created.');
}

}
