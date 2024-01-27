import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameQuestionListComponent } from './game-question-list.component';

describe('GameQuestionListComponent', () => {
    let component: GameQuestionListComponent;
    let fixture: ComponentFixture<GameQuestionListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameQuestionListComponent],
        });
        fixture = TestBed.createComponent(GameQuestionListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
