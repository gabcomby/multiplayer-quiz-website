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

        gameServiceSpy = jasmine.createSpyObj('GameService', ['leaveRoom'], {
            matchLobby: {
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
    it('should return playerNameValue fro service with playerName', () => {
        const result = component.playerName;
        expect(result).toBe(gameServiceSpy.playerNameValue);
    });
    it('should return lobbyCodeValue fro service with lobbyCode', () => {
        const result = component.lobbyCode;
        expect(result).toBe(gameServiceSpy.lobbyCodeValue);
    });
    it('should return isHostValue fro service with isHostValue', () => {
        const result = component.isHostValue;
        expect(result).toBe(gameServiceSpy.isHostValue);
    });

    it('should return nbrOfQuestionsValue from gameService with nbrOfQuestions', () => {
        const result = component.nbrOfQuestions;
        expect(result).toBe(gameServiceSpy.nbrOfQuestionsValue);
    });
    it('should return currentQuestionIndexValue from gameService with currentQuestionIndexValue', () => {
        const result = component.currentQuestionIndexValue;
        expect(result).toBe(gameServiceSpy.currentQuestionIndexValue);
    });
    it('should return currentGameTitle from gameService with currentGameTitle', () => {
        const result = component.currentGameTitle;
        expect(result).toBe(gameServiceSpy.gameTitleValue);
    });
    it('should return timerStoppedValue from gameService with timerStopped', () => {
        const result = component.timerStopped;
        expect(result).toBe(gameServiceSpy.timerStoppedValue);
    });
    it('should return currentTimerCountdown from gameService with currentTimerCountdown', () => {
        const result = component.currentTimerCountdown;
        expect(result).toBe(gameServiceSpy.timerCountdownValue);
    });
    it('should return totalgameDuration with totalGameDuration if launchtimer is false', () => {
        const result = component.totalGameDuration;
        expect(result).toBe(gameServiceSpy.totalQuestionDurationValue);
    });

    it('should call currentQuestionValue from gameService with currentQuestion', () => {
        const result = component.currentQuestion;
        expect(result).toBe(gameServiceSpy.currentQuestionValue);
    });

    it('should return playerListValue from gameService with playerList', () => {
        const result = component.playerList;
        expect(result).toBe(gameServiceSpy.playerListValue);
    });
    it('should return playerLeftListValue from gameService with playerLeftList', () => {
        const result = component.playerLeftList;
        expect(result).toBe(gameServiceSpy.playerLeftListValue);
    });

    it('should return isLaunchTimer from gameService with isLaunchTimer', () => {
        const result = component.isLaunchTimer;
        expect(result).toBe(gameServiceSpy.launchTimerValue);
    });

    it('should call handleGameLeave from gameService with handleGameLeave', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
    });
    it('should call setAnswerIndex from gameService with setAnswerIndex', () => {
        const newAnswerIdx = [1];
        gameServiceSpy['answerIndex'] = [];
        component.setAnswerIndex(newAnswerIdx);
        expect(gameServiceSpy['answerIndexSetter']).toEqual(newAnswerIdx);
    });
});
