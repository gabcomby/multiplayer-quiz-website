import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { API_BASE_URL } from '@app/app.module';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { AnswersPlayer } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { ApiService } from '@app/services/api.service';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { of } from 'rxjs';
import { ResultsViewComponent } from './results-view.component';

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;
    let gameService: GameService;
    // let snackbarService: SnackbarService
    // let httpController: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ResultsViewComponent],
            providers: [GameService, ApiService],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsViewComponent],
            providers: [
                HttpClient,
                MatSnackBar,
                SnackbarService,
                GameService,
                ApiService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
        });
        fixture = TestBed.createComponent(ResultsViewComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return player list value from game service', () => {
        const players: Player[] = [
            {
                id: 'player1',
                name: 'John',
                score: 0,
                bonus: 0,
                isLocked: false,
            },
            {
                id: 'player2',
                name: 'Alice',
                score: 0,
                bonus: 0,
                isLocked: false,
            },
        ];
        spyOnProperty(gameService, 'playerListFromLobby', 'get').and.returnValue(players);
        const playerListValue = component.playerListValue;
        expect(playerListValue).toEqual(players);
    });

    it('should call handleGameLeave of GameService', () => {
        spyOn(gameService, 'handleGameLeave');
        component.handleGameLeave();
        expect(gameService.handleGameLeave).toHaveBeenCalled();
    });

    it('should update answersQuestions when getPlayerAnswers emits', () => {
        const mockAnswers: AnswersPlayer[] = [
            new Map<string, number[]>([
                ['player1', [1, 2, 3]],
                ['player2', [1, 2, 3]],
            ]),
            new Map<string, number[]>([
                ['player3', [1, 2, 3]],
                ['player4', [1, 2, 3]],
            ]),
        ];
        spyOn(gameService, 'getPlayerAnswers').and.returnValue(of(mockAnswers));
        component.ngOnInit();
        expect(component.answersQuestions).toEqual(mockAnswers);
    });

    it('should update questions when questionGame emits', () => {
        const mockAnswers: AnswersPlayer[] = [
            new Map<string, number[]>([
                ['player1', [1, 2, 3]],
                ['player2', [1, 2, 3]],
            ]),
            new Map<string, number[]>([
                ['player3', [1, 2, 3]],
                ['player4', [1, 2, 3]],
            ]),
        ];
        spyOn(gameService, 'getPlayerAnswers').and.returnValue(of(mockAnswers));
        component.ngOnInit();
        expect(component.answersQuestions).toEqual(mockAnswers);
    });
});
