import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

import { DirectMsgListComponent } from './direct-msg-list.component';

describe('DirectMsgListComponent', () => {
  let component: DirectMsgListComponent;
  let fixture: ComponentFixture<DirectMsgListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      declarations: [ DirectMsgListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectMsgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
