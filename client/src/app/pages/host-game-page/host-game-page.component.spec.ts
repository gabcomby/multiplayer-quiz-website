/* eslint-disable -- Remove rules due to stub class + max lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { QuestionType } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game/game.service';
import { Subscription } from 'rxjs';
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
    let routerSpy: jasmine.SpyObj<Router>;
    let subscriptionSpy: jasmine.SpyObj<Subscription>;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        let store: any = {};
        const mockLocalStorage = {
            getItem: (key: string): string => {
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) => {
                store[key] = `${value}`;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            ['leaveRoom', 'nextQuestion', 'enablePanicMode', 'pauseTimer', 'timerCountdownValue', 'updateHistogram'],
            {
                lobbyCodeValue: 'testGameId',
                currentQuestionIndexValue: 0,
                nbrOfQuestionsValue: 5,
                timerCountdownValue: 60,
                totalQuestionDurationValue: 5,
                currentQuestionValue: {
                    type: QuestionType.QCM,
                    text: 'Mock Question?',
                    points: 10,
                    choices: [
                        { text: 'Mock Answer 1', isCorrect: false },
                        { text: 'Mock Answer 2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                    id: 'mockQuestion',
                },
                timerStoppedValue: false,
                playerListValue: [
                    { id: 'player1', name: 'Player 1', score: 0 },
                    { id: 'player2', name: 'Player 2', score: 0 },
                ],
                playerLeftListValue: [],
                answersTextQRLValue: ['Answer 1', 'Answer 2'],
                answersClickedValue: false,
                launchTimerValue: true,
                gameTitleValue: 'Test Game Title',
                numberInputModifidedValue: 0,
                gameTimerPausedValue: false,
            },
        );
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

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
                { provide: Router, useValue: routerSpyObj },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
        }).compileComponents();

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        component.subscription = subscriptionSpy;
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

    it('should return totalGameDuration from gameService with totalGameDuration', () => {
        const result = component.totalGameDuration;
        expect(result).toBe(gameServiceSpy.totalQuestionDurationValue);
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

    it('should return answersQRL from gameService with answersQRL', () => {
        const result = component.answersQRL;
        expect(result).toBe(gameServiceSpy.answersTextQRLValue);
    });

    it('should return answersClicked from gameService with answersClicked', () => {
        const result = component.answersClicked;
        expect(result).toBe(gameServiceSpy.answersClickedValue);
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

    it('should return isLaunchTimer from gameService with launchTimerValue', () => {
        const result = component.isLaunchTimer;
        expect(result).toBe(gameServiceSpy.launchTimerValue);
    });

    it('should return an array containing the current question when currentQuestionValue is not null', () => {
        const mockQuestion = {
            type: QuestionType.QCM,
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

    it('should return the number of modified questions from gameService with numberInputModifidedValue', () => {
        const result = component.nbModified;
        expect(result).toBe(gameServiceSpy.numberInputModifidedValue);
    });

    it('should call nextQuestion from gameService when nextQuestion is called', () => {
        component.nextQuestion();
        expect(gameServiceSpy.nextQuestion).toHaveBeenCalled();
    });
    it('should countdown and transition to "Prochaine question"', fakeAsync(() => {
        component.nextQuestionButtonText = '3';
        component.nextQuestion();
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('2');
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('1');
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('Prochaine question');
    }));

    it('should call nextQuestion from gameService when nextQuestion is called', () => {
        component.nextQuestion();
        expect(gameServiceSpy.nextQuestion).toHaveBeenCalled();
    });

    it('should call leaveRoom from gameService when handleGameLeave is called', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not navigate on ngOnInit if refreshedPage is not present', () => {
        component.ngOnInit();

        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to a page held in localStorage on ngOnInit if refreshedPage is present', () => {
        localStorage.setItem('refreshedPage', '/home');
        component.ngOnInit();

        expect(localStorage.removeItem).toHaveBeenCalledWith('refreshedPage');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call leaveRoom and set refreshedPage on beforeUnloadHandler', () => {
        const event = new Event('beforeunload');
        component.beforeUnloadHandler(event);

        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith('refreshedPage', '/home');
    });

    it('should return gameTimerPaused from gameService with gameTimerPausedValue', () => {
        const result = component.gameTimerPaused;
        expect(result).toBe(gameServiceSpy.gameTimerPausedValue);
    });

    it('should call pauseTimer from gameService when handlePauseTimer is called', () => {
        component.handlePauseTimer();
        expect(gameServiceSpy.pauseTimer).toHaveBeenCalled();
    });

    it('should call enablePanicMode from gameService when handlePanicMode is called', () => {
        component.handlePanicMode();
        expect(gameServiceSpy.enablePanicMode).toHaveBeenCalled();
    });

    it('should set isNoted property', () => {
        component.setIsNoted(true);
        expect(component.isNoted).toBe(true);
    });

    it('should set playerQRLPoints in gameService', () => {
        const mockPlayer = { id: 'player1', name: 'Player 1', score: 10, bonus: 0 };
        const mockPoints: [Player, number][] = [[mockPlayer, 10]];
        component.setplayerPointsQRL(mockPoints);
        expect(gameServiceSpy.playerQRLPoints).toEqual(mockPoints);
    });

    it('should update nextQuestionButtonText during countdown', fakeAsync(() => {
        component.nextQuestion();
        expect(component.nextQuestionButtonText).toBe('3');
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('2');
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('1');
        jasmine.clock().tick(1000);
        expect(component.nextQuestionButtonText).toBe('Prochaine question');
    }));
});
