import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddDirectChannelComponent } from './dialog-add-direct-channel.component';

describe('DialogAddDirectChannelComponent', () => {
  let component: DialogAddDirectChannelComponent;
  let fixture: ComponentFixture<DialogAddDirectChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogAddDirectChannelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddDirectChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
