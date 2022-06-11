import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddDirectMsgComponent } from './dialog-add-direct-msg.component';

describe('DialogAddDirectMsgComponent', () => {
  let component: DialogAddDirectMsgComponent;
  let fixture: ComponentFixture<DialogAddDirectMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddDirectMsgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddDirectMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
