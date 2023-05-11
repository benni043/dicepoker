import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceDisplayComponent } from './dice-display.component';

describe('DiceDisplayComponent', () => {
  let component: DiceDisplayComponent;
  let fixture: ComponentFixture<DiceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiceDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiceDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
