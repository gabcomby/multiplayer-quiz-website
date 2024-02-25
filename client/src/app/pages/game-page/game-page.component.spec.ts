/* eslint-disable -- Remove rules due to stub class + max lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game, Question } from '@app/interfaces/game';
import { Match } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
import { MatchService } from '@app/services/match.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of, throwError } from 'rxjs';
import { GamePageComponent } from './game-page.component';

const TEN = 10;

const TIME_BETWEEN_QUESTIONS = 3000;

@Component({
    selector: 'app-game-page-scoresheet',
    template: '',
})
class AppGamePageScoresheetStubComponent {
    @Input() players: unknown[];
}

@Component({
    selector: 'app-game-page-questions',
    template: '',
})
class AppGamePageQuestionsStubComponent {
    @Input() answerIsCorrect: unknown;
}

@Component({
    selector: 'app-game-page-timer',
    template: '',
})
class AppGamePageTimerStubComponent {
    @Input() timer: unknown;
}

@Component({
    selector: 'app-game-page-livechat',
    template: '',
})
class AppGamePageChatStubComponent {
    @Input() timer: unknown;
}

const questionMock: Question[] = [
    {
        type: 'multiple-choice',
        text: 'Question 1?',
        points: 10,
        choices: [
            { text: 'Answer 1', isCorrect: false },
            { text: 'Answer 2', isCorrect: true },
        ],
        lastModification: new Date(),
        id: 'q1',
    },
    {
        type: 'multiple-choice',
        text: 'Question 2?',
        points: 10,
        choices: [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: false },
        ],
        lastModification: new Date(),
        id: 'q2',
    },
];
const mockedGameData: Game = {
    id: 'game123',
    title: 'Test Game',
    description: 'Test Game Description',
    isVisible: true,
    duration: 10,
    lastModification: new Date(),
    questions: questionMock,
};
const mockedMatchData: Match = {
    id: 'match123',
    playerList: [
        { id: 'player1', name: 'Player 1', score: 0 },
        { id: 'player2', name: 'Player 2', score: 0 },
    ],
};
const updatedMatchDataWithPlayer: Match = {
    ...mockedMatchData,
    playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
};

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let matchService: jasmine.SpyObj<MatchService>;
    let socketService: jasmine.SpyObj<SocketService>;
    let router: Router;

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

        matchService.createNewMatch.and.returnValue(of(mockedMatchData));
        matchService.addPlayer.and.returnValue(of(updatedMatchDataWithPlayer));

        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                AppGamePageScoresheetStubComponent,
                AppGamePageQuestionsStubComponent,
                AppGamePageTimerStubComponent,
                AppGamePageChatStubComponent,
            ],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatIconModule, MatToolbarModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatchService, useValue: matchService },
                { provide: SocketService, useValue: socketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly initialize match and add player on init', async () => {
        spyOn(component, 'createMatch').and.callThrough();
        spyOn(component, 'addPlayerToMatch').and.callThrough();

        fixture.detectChanges();

        await fixture.whenStable();

        expect(matchService.createNewMatch).toHaveBeenCalledWith({ id: jasmine.any(String), playerList: [] });
        expect(matchService.addPlayer).toHaveBeenCalledWith({ id: 'playertest', name: 'Player 1', score: 0 }, jasmine.any(String));

        expect(component.currentMatch).toEqual(updatedMatchDataWithPlayer);

        expect(component.createMatch).toHaveBeenCalled();
        expect(component.addPlayerToMatch).toHaveBeenCalledWith(component.matchId);
    });

    it('should correctly setup WebSocket events', async () => {
        spyOn(component, 'setupWebSocketEvents').and.callThrough();
        component.gameData = mockedGameData;

        fixture.detectChanges();

        await fixture.whenStable();

        expect(socketService.connect).toHaveBeenCalled();
        expect(socketService.onTimerCountdown).toHaveBeenCalled();
        expect(socketService.setTimerDuration).toHaveBeenCalledWith(component.gameData.duration);
        expect(socketService.onAnswerVerification).toHaveBeenCalled();
        expect(component.setupWebSocketEvents).toHaveBeenCalled();
    });

    it('should fetch game data on init and handle errors', () => {
        const gameService = TestBed.inject(GameService);
        spyOn(gameService, 'getGame').and.returnValue(throwError(() => new Error('Failed to fetch game data')));
        const snackbarService = TestBed.inject(SnackbarService);
        spyOn(snackbarService, 'openSnackBar');

        component.ngOnInit();

        expect(gameService.getGame).toHaveBeenCalledWith('testGameId');
        expect(snackbarService.openSnackBar).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('should transition to the next question correctly', fakeAsync(() => {
        component.gameData.questions = questionMock;
        component.currentQuestionIndex = 0;

        component.handleNextQuestion();
        tick(TIME_BETWEEN_QUESTIONS);

        expect(component.currentQuestionIndex).toBe(1);
        expect(component.questionHasExpired).toBeFalse();
        expect(socketService.startTimer).toHaveBeenCalled();
    }));

    it('should fetch game data on init and set gameData property', async () => {
        const gameService = TestBed.inject(GameService);

        spyOn(gameService, 'getGame').and.returnValue(of(mockedGameData));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(gameService.getGame).toHaveBeenCalledWith('testGameId');
        expect(component.gameData).toEqual(mockedGameData);
    });

    it('should catch the error in createAndSetupMatch and show an alert', fakeAsync(() => {
        const errorMessage = 'Test error message';
        spyOn(component, 'createMatch').and.returnValue(throwError(() => new Error(errorMessage)));
        spyOn(window, 'alert');

        component.createAndSetupMatch();
        tick();

        expect(window.alert).toHaveBeenCalledWith(errorMessage);
    }));

    it('should handle timer countdown correctly', () => {
        component.gameData = mockedGameData;
        spyOn(component, 'onTimerComplete').and.callThrough();

        socketService.onTimerCountdown.and.callFake((callback: (data: number) => void) => {
            callback(1);
            callback(0);
        });

        component.setupWebSocketEvents();

        expect(component.onTimerComplete).toHaveBeenCalled();
    });

    it('should stop the timer, disconnect, and navigate to "/new-game" on successful match deletion', () => {
        matchService.deleteMatch.and.returnValue(of(mockedMatchData));

        component.handleGameLeave();

        expect(matchService.deleteMatch).toHaveBeenCalledWith(component.matchId);
        expect(socketService.stopTimer).toHaveBeenCalled();
        expect(socketService.disconnect).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/new-game']);
    });

    it('should alert an error message if match deletion fails', () => {
        const mockError = new Error('Deletion failed');
        matchService.deleteMatch.and.returnValue(throwError(() => mockError));
        spyOn(window, 'alert');

        component.handleGameLeave();

        expect(window.alert).toHaveBeenCalledWith(mockError.message);
    });

    it('should update the player score on successful score update', () => {
        component.currentMatch = mockedMatchData;
        const initialScore = component.currentMatch.playerList[0].score;
        const scoreFromQuestion = 10;
        const updatedPlayer = { ...component.currentMatch.playerList[0], score: initialScore + scoreFromQuestion };
        matchService.updatePlayerScore.and.returnValue(of(updatedPlayer));

        component.updatePlayerScore(scoreFromQuestion);

        expect(matchService.updatePlayerScore).toHaveBeenCalledWith(component.matchId, 'playertest', initialScore + scoreFromQuestion);
        expect(component.currentMatch.playerList[0].score).toEqual(initialScore + scoreFromQuestion);
    });

    it('should alert an error message if updating player score fails', () => {
        component.currentMatch = mockedMatchData;
        const mockError = new Error('Failed to update score');
        matchService.updatePlayerScore.and.returnValue(throwError(() => mockError));
        spyOn(window, 'alert');

        component.updatePlayerScore(TEN);

        expect(window.alert).toHaveBeenCalledWith(mockError.message);
    });

    it('should call handleNextQuestion if more questions remain', fakeAsync(() => {
        component.currentQuestionIndex = 0;
        component.gameData = mockedGameData;
        spyOn(component, 'handleNextQuestion');

        component.onTimerComplete();
        tick(TIME_BETWEEN_QUESTIONS);

        expect(socketService.stopTimer).toHaveBeenCalled();
        expect(component.questionHasExpired).toBeTrue();
        expect(component.previousQuestionIndex).toBe(0);
        expect(socketService.verifyAnswers).toHaveBeenCalledWith(jasmine.any(Object), component.answerIdx);
        expect(component.handleNextQuestion).toHaveBeenCalled();
    }));

    it('should call handleGameLeave if no more questions remain', fakeAsync(() => {
        component.currentQuestionIndex = 1;
        component.gameData = mockedGameData;
        spyOn(component, 'handleGameLeave');

        component.onTimerComplete();
        tick(TIME_BETWEEN_QUESTIONS);

        expect(socketService.stopTimer).toHaveBeenCalled();
        expect(component.questionHasExpired).toBeTrue();
        expect(component.previousQuestionIndex).toBe(1);
        expect(socketService.verifyAnswers).toHaveBeenCalledWith(jasmine.any(Object), component.answerIdx);
        expect(component.handleGameLeave).toHaveBeenCalled();
    }));

    it('should update player score when the answer is correct', () => {
        const answerIsCorrect = true;
        const questionPoints = 10;
        const FIRST_TO_ANSWER_MULTIPLIER = 1.2;
        component.gameData = mockedGameData;
        component.previousQuestionIndex = 0;
        spyOn(component, 'updatePlayerScore');

        socketService.onAnswerVerification.and.callFake((callback) => {
            callback(answerIsCorrect);
        });

        component.setupWebSocketEvents();

        expect(component.answerIsCorrect).toBeTrue();
        expect(component.updatePlayerScore).toHaveBeenCalledWith(questionPoints * FIRST_TO_ANSWER_MULTIPLIER);
    });

    it('should not update player score when the answer is incorrect', () => {
        const answerIsCorrect = false;
        component.gameData = mockedGameData;
        component.previousQuestionIndex = 0;
        spyOn(component, 'updatePlayerScore');

        socketService.onAnswerVerification.and.callFake((callback) => {
            callback(answerIsCorrect);
        });

        component.setupWebSocketEvents();

        expect(component.answerIsCorrect).toBeFalse();
        expect(component.updatePlayerScore).not.toHaveBeenCalled();
    });

    it('should set the answerIndex value correctly', () => {
        const answerIndex = [0, 1];
        component.setAnswerIndex(answerIndex);
        expect(component.answerIdx).toEqual(answerIndex);
    });
});
