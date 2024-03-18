/* eslint-disable -- Remove rules due to stub class + max lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { GameService } from '@app/services/game.service';
import { HostGamePageComponent } from './host-game-page.component';

@Component({
    selector: 'app-game-page-scoresheet',
    template: '',
})
class AppHostGamePageScoresheetStubComponent {
    @Input() players: unknown[];
}

@Component({
    selector: 'app-game-page-questions',
    template: '',
})
class AppHostGamePageQuestionsStubComponent {
    @Input() answerIsCorrect: unknown;
}

@Component({
    selector: 'app-game-page-timer',
    template: '',
})
class AppHostGamePageTimerStubComponent {
    @Input() timer: unknown;
}

@Component({
    selector: 'app-game-page-livechat',
    template: '',
})
class AppHostGamePageChatStubComponent {
    @Input() timer: unknown;
}

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        gameServiceSpy = jasmine.createSpyObj('GameService', ['leaveRoom', 'nextQuestion'], {
            matchLobby: {
                id: 'match123',
                playerList: [
                    { id: 'player1', name: 'Player 1', score: 0 },
                    { id: 'player2', name: 'Player 2', score: 0 },
                ],
                hostId: '334',
            },
            currentQuestionValue: null,
            totalGameDurationValue: 5,
        });

        await TestBed.configureTestingModule({
            declarations: [
                HostGamePageComponent,
                AppHostGamePageScoresheetStubComponent,
                AppHostGamePageQuestionsStubComponent,
                AppHostGamePageTimerStubComponent,
                AppHostGamePageChatStubComponent,
            ],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatIconModule, MatToolbarModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        jasmine.getEnv().allowRespy(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should return lobbyCode from gameService with lobbyCodeValue', () => {
        const result = component.lobbyCode;
        expect(result).toBe(gameServiceSpy.lobbyCodeValue);
    });
    it('should return currentQuestionIndexValue from gameService with currentQuestionIndexValue', () => {
        const result = component.currentQuestionIndexValue;
        expect(result).toBe(gameServiceSpy.currentQuestionIndexValue);
    });
    it('should return nbrOfQuestions from gameService with nbrOfQuestions', () => {
        const result = component.nbrOfQuestions;
        expect(result).toBe(gameServiceSpy.nbrOfQuestionsValue);
    });
    it('should return currentTimerCountdown from gameService with currentTimerCountdown', () => {
        const result = component.currentTimerCountdown;
        expect(result).toBe(gameServiceSpy.timerCountdownValue);
    });
    it('should return start timer duration with totalGameDuration if launchtimer is true', () => {
        spyOnProperty(component, 'isLaunchTimer').and.returnValue(false);
        const result = component.totalGameDuration;
        expect(result).toBe(gameServiceSpy['totalQuestionDuration']);
    });

    it('should call handleGameLeave from gameService with handleGameLeave', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
    });

    it('should return playerList from gameService with playerList', () => {
        const result = component.playerList;
        expect(result).toBe(gameServiceSpy.playerListValue);
    });

    it('should return playerLeftList from gameService with playerLeftList', () => {
        const result = component.playerLeftList;
        expect(result).toBe(gameServiceSpy.playerLeftListValue);
    });

    it('should return currentQuestion from gameService with currentQuestion', () => {
        const expectedQuestion = gameServiceSpy.currentQuestionValue;
        const actualQuestion = component.currentQuestion;
        expect(actualQuestion).toEqual(expectedQuestion);
    });

    it('should return timerStopped from gameService with timerStopped', () => {
        const result = component.timerStopped;
        expect(result).toBe(gameServiceSpy.timerStoppedValue);
    });

    it('should return answersClicked from gameService with answersClicked', () => {
        const result = component.answersClicked;
        expect(result).toBe(gameServiceSpy['answersClicked']);
    });

    it('should return isLaunchTimer from gameService with launchTimerValue', () => {
        const result = component.isLaunchTimer;
        expect(result).toBe(gameServiceSpy.launchTimerValue);
    });

    it('should return an empty array when currentQuestionValue is null', () => {
        const result = component.currentQuestionArray;
        expect(result).toEqual([]);
    });

    it('should return an array containing the current question when currentQuestionValue is not null', () => {
        const mockQuestion = {
            type: 'multiple-choice',
            text: 'Mock Question?',
            points: 10,
            choices: [
                { text: 'Mock Answer 1', isCorrect: false },
                { text: 'Mock Answer 2', isCorrect: true },
            ],
            lastModification: new Date(),
            id: 'mockQuestion',
        };
        spyOnProperty(gameServiceSpy, 'currentQuestionValue').and.returnValue(mockQuestion);

        const expectedQuestionArray = [mockQuestion];
        const result = component.currentQuestionArray;
        expect(result).toEqual(expectedQuestionArray);
    });

    it('should return the game title from gameService with gameTitleValue', () => {
        const result = component.currentGameTitle;
        expect(result).toBe(gameServiceSpy.gameTitleValue);
    });

    it('should call nextQuestion from gameService when nextQuestion is called', () => {
        component.nextQuestion();
        expect(gameServiceSpy.nextQuestion).toHaveBeenCalled();
    });

    it('should call leaveRoom from gameService when handleGameLeave is called', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
    });
});
