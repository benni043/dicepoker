import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayDiceNewComponent } from './display-dice-new.component';

describe('DisplayDiceNewComponent', () => {
  let component: DisplayDiceNewComponent;
  let fixture: ComponentFixture<DisplayDiceNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayDiceNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayDiceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
