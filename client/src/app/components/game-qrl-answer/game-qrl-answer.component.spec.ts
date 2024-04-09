import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnackbarService } from '@app/services/snackbar.service';
import { GameQrlAnswerComponent } from './game-qrl-answer.component';

describe('GameQrlAnswerComponent', () => {
    let component: GameQrlAnswerComponent;
    let fixture: ComponentFixture<GameQrlAnswerComponent>;
    let snackbarService: SnackbarService;

    beforeEach(() => {
        snackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        TestBed.configureTestingModule({
            declarations: [GameQrlAnswerComponent],
            providers: [{ provide: SnackbarService, useValue: snackbarService }],
        });
        fixture = TestBed.createComponent(GameQrlAnswerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
