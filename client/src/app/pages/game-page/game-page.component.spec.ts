import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatchService } from '@app/services/match.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

const TEN = 10;

// const TIME_BETWEEN_QUESTIONS = 3000;

// const questionMock: Question[] = [
//     {
//         type: 'multiple-choice',
//         text: 'Question 1?',
//         points: 10,
//         choices: [
//             { text: 'Answer 1', isCorrect: false },
//             { text: 'Answer 2', isCorrect: true },
//         ],
//         lastModification: new Date(),
//         id: 'q1',
//     },
//     {
//         type: 'multiple-choice',
//         text: 'Question 2?',
//         points: 10,
//         choices: [
//             { text: 'Answer 1', isCorrect: true },
//             { text: 'Answer 2', isCorrect: false },
//         ],
//         lastModification: new Date(),
//         id: 'q2',
//     },
// ];
// const mockedGameData: Game = {
//     id: 'game123',
//     title: 'Test Game',
//     description: 'This is a test game',
//     isVisible: true,
//     duration: 30,
//     lastModification: new Date(),
//     questions: questionMock,
// };
const mockedMatchData = {
    id: 'match123',
    playerList: [],
};
const updatedMatchDataWithPlayer = {
    ...mockedMatchData,
    playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
};

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let matchService: jasmine.SpyObj<MatchService>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        matchService = jasmine.createSpyObj('MatchService', ['createNewMatch', 'addPlayer', 'deleteMatch', 'updatePlayerScore']);
        socketService = jasmine.createSpyObj('SocketService', [
            'connect',
            'disconnect',
            'startTimer',
            'stopTimer',
            'onTimerCountdown',
            'onAnswerVerification',
            'setTimerDuration',
            'verifyAnswers',
        ]);

        // socketService.onTimerDuration = jasmine.createSpy('onTimerDuration').and.callFake((callback) => {
        //     // Simulate calling the callback with mock data
        //     const mockMessage = 'Timer duration set to 30 seconds'; // Example duration
        //     callback(mockMessage);
        // });

        // socketService.onTimerUpdate = jasmine.createSpy('onTimerUpdate').and.callFake((callback) => {
        //     // Simulate calling the callback with mock data
        //     const mockMessage = 'Timer started'; // Example time
        //     callback(mockMessage);
        // });

        // socketService.setTimerDuration = jasmine.createSpy('setTimerDuration').and.callThrough();

        // Mock the API calls to return Observables of mock data
        matchService.createNewMatch.and.returnValue(of(mockedMatchData));
        matchService.addPlayer.and.returnValue(of(updatedMatchDataWithPlayer));

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatchService, useValue: matchService },
                { provide: SocketService, useValue: socketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly initialize match and add player on init', () => {
        spyOn(component, 'createMatch').and.callThrough();
        spyOn(component, 'addPlayerToMatch').and.callThrough();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(matchService.createNewMatch).toHaveBeenCalledWith({ id: jasmine.any(String), playerList: [] });
            expect(matchService.addPlayer).toHaveBeenCalledWith({ id: 'playertest', name: 'Player 1', score: 0 }, jasmine.any(String));

            expect(component.currentMatch).toEqual(updatedMatchDataWithPlayer);

            expect(component.createMatch).toHaveBeenCalled();
            expect(component.addPlayerToMatch).toHaveBeenCalledWith(component.matchId);
        });
    });

    it('should correctly setup WebSocket events', () => {
        spyOn(component, 'setupWebSocketEvents').and.callThrough();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(socketService.connect).toHaveBeenCalled();
            expect(socketService.onTimerCountdown).toHaveBeenCalled();
            expect(socketService.setTimerDuration).toHaveBeenCalledWith(component.gameData.duration);
            expect(socketService.onTimerDuration).toHaveBeenCalled();
            expect(socketService.onTimerUpdate).toHaveBeenCalled();
            expect(socketService.onAnswerVerification).toHaveBeenCalled();
            expect(component.setupWebSocketEvents).toHaveBeenCalled();
        });
    });

    it('should correctly update player score', () => {
        spyOn(component, 'updatePlayerScore').and.callThrough();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            component.updatePlayerScore(TEN);

            expect(matchService.updatePlayerScore).toHaveBeenCalledWith(component.matchId, 'playertest', TEN);
            expect(component.updatePlayerScore).toHaveBeenCalledWith(TEN);
        });
    });

    // it('should fetch game data on init and handle errors', () => {
    //     const apiService = TestBed.inject(ApiService);
    //     spyOn(apiService, 'getGame').and.returnValue(throwError(() => new Error('Failed to fetch game data')));
    //     const snackbarService = TestBed.inject(SnackbarService);
    //     spyOn(snackbarService, 'openSnackBar');

    //     component.ngOnInit();

    //     expect(apiService.getGame).toHaveBeenCalledWith('testGameId');
    //     expect(snackbarService.openSnackBar).toHaveBeenCalledWith(jasmine.any(String));
    // });

    // it('should handle timer countdown and question expiration correctly', fakeAsync(() => {
    //     component.gameData = mockedGameData;
    //     component.gameData.duration = 30;
    //     socketService.onTimerCountdown.and.callFake((callback) => {
    //         callback(0); // Simulate timer reaching 0
    //     });

    //     component.setupWebSocketEvents();
    //     tick(); // Fast-forward any asynchronous code

    //     expect(component.questionHasExpired).toBeTrue();
    //     expect(component.onTimerComplete).toHaveBeenCalled();
    // }));

    // it('should transition to the next question correctly', fakeAsync(() => {
    //     component.gameData.questions = questionMock;
    //     component.currentQuestionIndex = 0;

    //     component.handleNextQuestion();
    //     tick(TIME_BETWEEN_QUESTIONS);

    //     expect(component.currentQuestionIndex).toBe(1);
    //     expect(component.questionHasExpired).toBeFalse();
    //     expect(socketService.startTimer).toHaveBeenCalled();
    // }));

    // it('should handle errors when updating player score fails', () => {
    //     matchService.updatePlayerScore.and.returnValue(throwError(() => new Error('Failed to update score')));
    //     spyOn(window, 'alert');

    //     component.updatePlayerScore(TEN);

    //     expect(window.alert).toHaveBeenCalledWith(jasmine.any(String));
    // });
});
