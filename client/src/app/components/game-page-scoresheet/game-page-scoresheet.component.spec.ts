import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageScoresheetComponent } from './game-page-scoresheet.component';

describe('GamePageScoresheetComponent', () => {
    let component: GamePageScoresheetComponent;
    let fixture: ComponentFixture<GamePageScoresheetComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GamePageScoresheetComponent],
        });
        fixture = TestBed.createComponent(GamePageScoresheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
