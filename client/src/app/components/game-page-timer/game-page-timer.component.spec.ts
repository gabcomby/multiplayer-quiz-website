import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageTimerComponent } from './game-page-timer.component';

describe('GamePageTimerComponent', () => {
  let component: GamePageTimerComponent;
  let fixture: ComponentFixture<GamePageTimerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GamePageTimerComponent]
    });
    fixture = TestBed.createComponent(GamePageTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
