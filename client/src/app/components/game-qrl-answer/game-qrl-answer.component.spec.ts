import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/match';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
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

    it('should sort answersQRLInput when set', () => {
        const player1: Player = { name: 'B', id: '1', score: 10, bonus: 1 };
        const player2: Player = { name: 'A', id: '2', score: 10, bonus: 1 };
        component.answersQRL = [
            [player1, 'answer1'],
            [player2, 'answer2'],
        ];
        expect(component.answersQRLInput[0][0].name).toBe('A');
        expect(component.answersQRLInput[1][0].name).toBe('B');
    });

    it('should sort answersQRLInput when ngOnChanges is called', () => {
        const player1: Player = { name: 'B', id: '1', score: 10, bonus: 1 };
        const player2: Player = { name: 'A', id: '2', score: 10, bonus: 1 };
        component.answersQRLInput = [
            [player1, 'answer1'],
            [player2, 'answer2'],
        ];
        component.ngOnChanges({
            answersQRL: { currentValue: component.answersQRLInput, previousValue: [], firstChange: true, isFirstChange: () => false },
        });
        expect(component.answersQRLInput[0][0].name).toBe('A');
        expect(component.answersQRLInput[1][0].name).toBe('B');
    });

    it('should emit selectedValues when setSelectedValues is called', () => {
        const player1: Player = { name: 'B', id: '1', score: 10, bonus: 1 };

        const spy = spyOn(component.selectedValuesEmitter, 'emit');
        component.setSelectedValues([player1, 1], 0);
        expect(spy).toHaveBeenCalledWith([[player1, 1]]);
    });
});
