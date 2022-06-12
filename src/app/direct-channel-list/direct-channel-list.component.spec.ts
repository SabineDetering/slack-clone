import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

import { DirectChannelListComponent } from './direct-channel-list.component';

describe('DirectChannelListComponent', () => {
  let component: DirectChannelListComponent;
  let fixture: ComponentFixture<DirectChannelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      declarations: [DirectChannelListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectChannelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
