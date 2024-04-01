import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameQrlAnswerComponent } from './game-qrl-answer.component';

describe('GameQrlAnswerComponent', () => {
  let component: GameQrlAnswerComponent;
  let fixture: ComponentFixture<GameQrlAnswerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameQrlAnswerComponent]
    });
    fixture = TestBed.createComponent(GameQrlAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
