import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GamePageScoresheetComponent } from './game-page-scoresheet.component';

describe('GamePageScoresheetComponent', () => {
    let component: GamePageScoresheetComponent;
    let fixture: ComponentFixture<GamePageScoresheetComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GamePageScoresheetComponent],
            imports: [MatCardModule, MatFormFieldModule],
        });
        fixture = TestBed.createComponent(GamePageScoresheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
