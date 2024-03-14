import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { API_BASE_URL } from '@app/app.module';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { AnswersPlayer, Question } from '@app/interfaces/game';
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ResultsViewComponent],
            providers: [GameService, ApiService],
        }).compileComponents();
    }));

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
        const fakeQuestions: Question[] = [
            {
                type: 'Multiple Choice',
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'London', isCorrect: false },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'Rome', isCorrect: false },
                ],
                lastModification: new Date(),
                id: '1',
            },
            {
                type: 'True/False',
                text: 'The Earth is flat.',
                points: 5,
                choices: [
                    { text: 'True', isCorrect: false },
                    { text: 'False', isCorrect: true },
                ],
                lastModification: new Date(),
                id: '2',
            },
        ];

        gameService.questionGame.next(fakeQuestions);

        component.ngOnInit();

        expect(component.questions).toEqual(fakeQuestions);
    });

    it('should sort dataSource correctly', () => {
        const unsortedPlayers: Player[] = [
            { name: 'Player 1', score: 10, id: 'a', bonus: 1 },
            { name: 'Player 3', score: 5, id: 'b', bonus: 2 },
            { name: 'Player 2', score: 10, id: 'c', bonus: 1 },
        ];
        const sortedPlayers: Player[] = [
            { name: 'Player 1', score: 10, id: 'a', bonus: 1 },
            { name: 'Player 2', score: 10, id: 'c', bonus: 1 },
            { name: 'Player 3', score: 5, id: 'b', bonus: 2 },
        ];

        component.dataSource = unsortedPlayers;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callThrough();
        sortDataSourceSpy.call(component);
        expect(sortDataSourceSpy).toHaveBeenCalled();
        expect(component.dataSource).toEqual(sortedPlayers);
    });
});
