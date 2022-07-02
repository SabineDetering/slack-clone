import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUsermenuComponent } from './dialog-usermenu.component';

describe('DialogUsermenuComponent', () => {
  let component: DialogUsermenuComponent;
  let fixture: ComponentFixture<DialogUsermenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogUsermenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUsermenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
