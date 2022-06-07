import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMsgListComponent } from './direct-msg-list.component';

describe('DirectMsgListComponent', () => {
  let component: DirectMsgListComponent;
  let fixture: ComponentFixture<DirectMsgListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
