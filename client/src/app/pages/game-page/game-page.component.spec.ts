/* eslint-disable -- Remove rules due to stub class + max lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { GameService } from '@app/services/game.service';
import { GamePageComponent } from './game-page.component';
import { Question } from '@app/interfaces/game';

// const TEN = 10;

// const TIME_BETWEEN_QUESTIONS = 3000;
const START_TIMER_DURATION = 5;

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
// const mockedGameData: Game = {
//     id: 'game123',
//     title: 'Test Game',
//     description: 'Test Game Description',
//     isVisible: true,
//     duration: 10,
//     lastModification: new Date(),
//     questions: questionMock,
// };
// const mockedMatchData: Match = {
//     id: 'match123',
//     playerList: [
//         { id: 'player1', name: 'Player 1', score: 0 },
//         { id: 'player2', name: 'Player 2', score: 0 },
//     ],
// };
// const updatedMatchDataWithPlayer: Match = {
//     ...mockedMatchData,
//     playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
// };

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    // let router: Router;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        gameServiceSpy = jasmine.createSpyObj('GameService',['handleGameLeave', 'setAnswerIndex', 'clickPlayerAnswer', 'getCurrentQuestion'], {
            matchLobby : {
                id: 'match123',
                playerList: [
                    { id: 'player1', name: 'Player 1', score: 0 },
                    { id: 'player2', name: 'Player 2', score: 0 },
                ],
                hostId: '334',
            },
        });

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
                { provide: GameService, useValue: gameServiceSpy },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return currentGameLenght from gameService with currentGameLenght', () => {
        const result = component.currentGameLength;
        expect(result).toBe(gameServiceSpy.currentGameLength);
    });
    it('should return currentQuestionIndexValue from gameService with currentQuestionIndexValue', () => {
        const result = component.currentQuestionIndexValue;
        expect(result).toBe(gameServiceSpy.currentQuestionIndexValue);
    });
    it('should return currentGameTitle from gameService with currentGameTitle', () => {
        const result = component.currentGameTitle;
        expect(result).toBe(gameServiceSpy.currentGameTitle);
    });
    it('should return currentPlayerNameValue from gameService with currentPlayerNameValue', () => {
        const result = component.currentPlayerNameValue;
        expect(result).toBe(gameServiceSpy.currentPlayerNameValue);
    });
    it('should return currentTimerCountdown from gameService with currentTimerCountdown', () => {
        const result = component.currentTimerCountdown;
        expect(result).toBe(gameServiceSpy.timerCountdownValue);
    });
    it('should return totalgameDuration with totalGameDuration if launchtimer is false', () => {
        spyOnProperty(component, 'isLaunchTimer').and.returnValue(false);
        const result = component.totalGameDuration;
        expect(result).toBe(gameServiceSpy.totalGameDuration);
    });
    it('should return start timer duration with totalGameDuration if launchtimer is true', () => {
        spyOnProperty(component, 'isLaunchTimer').and.returnValue(true);
        const result = component.totalGameDuration;
        expect(result).toBe(START_TIMER_DURATION);
    });
    it('should call getCurrentQuestion from gameService with currentQuestion', () => {
        gameServiceSpy.getCurrentQuestion.and.returnValue(questionMock[0]);
        const result = component.currentQuestion;
        expect(result).toBe(questionMock[0]);
    });
    it('should return questionHasExpired from gameService with questionHasExpiredValue', () => {
        const result = component.questionHasExpiredValue;
        expect(result).toBe(gameServiceSpy.questionHasExpired);
    });
    it('should return answerIsCorrect from gameService with answerIsCorrectValue', () => {
        const result = component.answerIsCorrectValue;
        expect(result).toBe(gameServiceSpy.answerIsCorrect);
    });
    it('should return playerListFromLobby from gameService with playerListValue', () => {
        const result = component.playerListValue;
        expect(result).toBe(gameServiceSpy.playerListFromLobby);
    });
    it('should return currentPlayerId from gameService with currentPlayerId', () => {
        const result = component.currentPlayerId;
        expect(result).toBe(gameServiceSpy.currentPlayerId);
    });
    it('should return hostId from gameService with hostId', () => {
        const result = component.hostId;
        expect(result).toBe(gameServiceSpy.matchLobby.hostId);
    });
    it('should return isLaunchTimer from gameService with isLaunchTimer', () => {
        const result = component.isLaunchTimer;
        expect(result).toBe(gameServiceSpy.isLaunchTimerValue);
    });
    it('should return lobbyCode from gameService with lobbyCode', () => {
        const result = component.lobbyCode;
        expect(result).toBe(gameServiceSpy.matchLobby.lobbyCode);
    });
    it('should return true if is the host', () => {
        gameServiceSpy.matchLobby.hostId = '234';
        gameServiceSpy.currentPlayerId = '234';
        const result = component.getHost;
        expect(result).toBeTrue();
    });
    it('should return false if is not the host', () => {
        gameServiceSpy.currentPlayerId = '335';
        const result = component.getHost;
        expect(result).toBeFalse();
    });
    it('should return endGame from gameService with endGame', () => {
        const result = component.endGame;
        expect(result).toBe(gameServiceSpy.endGame);
    });
    it('should call handleGameLeave from gameService with handleGameLeave', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.handleGameLeave).toHaveBeenCalled();
        
    });
    it('should call setAnswerIndex and clickPlayerAnswer from gameService with setAnswerIndex', () => {
        const answerIdx = [1];
        component.setAnswerIndex(answerIdx);
        expect(gameServiceSpy.setAnswerIndex).toHaveBeenCalled();
        expect(gameServiceSpy.clickPlayerAnswer).toHaveBeenCalled();
    });
});
