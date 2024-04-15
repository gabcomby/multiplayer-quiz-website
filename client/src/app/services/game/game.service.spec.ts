/* eslint-disable max-lines */
// /* eslint-disable max-lines */

import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import { Question, QuestionType } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from './game.service';
import { QRL_TIMER_DURATION, SOCKET_TIMER_DURATION, TIME_BETWEEN_QUESTIONS, WAIT_UNTIL_FIRE_DISCONNECTS } from '@app/config/client-config';
// eslint-disable-next-line no-restricted-imports
import { SocketService } from '../socket/socket.service';

describe('GameService', () => {
    let service: GameService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const date = new Date();

    beforeEach(() => {
        const socketServiceSpyObj = jasmine.createSpyObj('SocketService', [
            'connect',
            'disconnect',
            'leaveRoom',
            'sendLiveAnswers',
            'banPlayer',
            'startGame',
            'nextQuestion',
            'sendLockedAnswers',
            'onRoomCreated',
            'onRoomTestCreated',
            'onTimerCountdown',
            'onPlayerListChange',
            'onPlayerLeftListChange',
            'onLobbyDeleted',
            'onRoomJoined',
            'onBannedFromGame',
            'onRoomLockStatus',
            'onGameLaunch',
            'onQuestion',
            'onQuestionTimeUpdated',
            'onTimerStopped',
            'onLivePlayerAnswers',
            'onGoToResult',
            'sendAnswers',
            'onPanicModeEnabled',
            'onPanicModeDisabled',
            'pauseTimer',
            'enablePanicMode',
            'onLockedAnswersQRL',
            'onUpdateNbModified',
            'updatePointsQRL',
        ]);
        const snackbarServiceSpyObj = jasmine.createSpyObj('SnackbarService', ['openSnackbar']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameService,
                { provide: SocketService, useValue: socketServiceSpyObj },
                { provide: Router, useValue: routerSpyObj },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
            imports: [MatSnackBarModule, BrowserAnimationsModule],
        });

        service = TestBed.inject(GameService);
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;

        snackbarServiceSpyObj.openSnackbar.and.returnValue();

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get player name', () => {
        const playerNameSpy = service['playerName'];
        const result = service.playerNameValue;
        expect(result).toBe(playerNameSpy);
    });
    it('should get lobby code value', () => {
        const lobbyCodeSpy = service['lobbyCode'];
        const result = service.lobbyCodeValue;
        expect(result).toBe(lobbyCodeSpy);
    });

    it('should get playerListValue', () => {
        const playerListSpy = service['playerList'];
        const result = service.playerListValue;
        expect(result).toBe(playerListSpy);
    });
    it('should get currentQRLIndexValue', () => {
        const playerListSpy = service['currentQRLIndex'];
        const result = service.currentQRLIndexValue;
        expect(result).toBe(playerListSpy);
    });
    it('should get playerListResultValue', () => {
        const playerListSpy = service['playersListResultValue'];
        const result = service.playersListResultValue;
        expect(result).toBe(playerListSpy);
    });
    it('should get currentPlayer', () => {
        const playerListSpy = service['currentPlayer'];
        const result = service.currentPlayerValue;
        expect(result).toBe(playerListSpy);
    });

    it('should get playerLeftListValue', () => {
        const playerLeftListSpy = service['playerLeftList'];
        const result = service.playerLeftListValue;
        expect(result).toBe(playerLeftListSpy);
    });

    it('should get isHostValue', () => {
        const isHostSpy = service['isHost'];
        const result = service.isHostValue;
        expect(result).toBe(isHostSpy);
    });

    it('should get roomIsLockedValue', () => {
        const roomLockedSpy = service['roomLocked'];
        const result = service.roomIsLockedValue;
        expect(result).toBe(roomLockedSpy);
    });

    it('should get launchTimerValue', () => {
        const launchTimerSpy = service['launchTimer'];
        const result = service.launchTimerValue;
        expect(result).toBe(launchTimerSpy);
    });

    it('should get timerCountdownValue', () => {
        const timerCountdownSpy = service['timerCountdown'];
        const result = service.timerCountdownValue;
        expect(result).toBe(timerCountdownSpy);
    });

    it('should get test value', () => {
        const testSpy = service['isTest'];
        const result = service.isTestValue;
        expect(result).toBe(testSpy);
    });

    it('should get currentQuestionIndexValue', () => {
        const currentQuestionIndexSpy = service['currentQuestionIndex'];
        const result = service.currentQuestionIndexValue;
        expect(result).toBe(currentQuestionIndexSpy);
    });

    it('should get nbrOfQuestionsValue', () => {
        const nbrOfQuestionsSpy = service['nbrOfQuestions'];
        const result = service.nbrOfQuestionsValue;
        expect(result).toBe(nbrOfQuestionsSpy);
    });

    it('should get gameTimerPausedValue', () => {
        const gameTimerPausedSpy = service['gameTimerPaused'];
        const result = service.gameTimerPausedValue;
        expect(result).toBe(gameTimerPausedSpy);
    });
    it('should get answersTextQRLValue', () => {
        const gameTimerPausedSpy = service['answersTextQRL'];
        const result = service.answersTextQRLValue;
        expect(result).toBe(gameTimerPausedSpy);
    });
    it('should get answerTextQRLValue', () => {
        const gameTimerPausedSpy = service['answerText'];
        const result = service.answerTextQRLValue;
        expect(result).toBe(gameTimerPausedSpy);
    });

    it('should get numberInputModifidedValue', () => {
        const gameTimerPausedSpy = service['numberInputModified'];
        const result = service.numberInputModifidedValue;
        expect(result).toBe(gameTimerPausedSpy);
    });
    it('should increment countAnswerQrl and set answerText correctly', () => {
        const initialCount = service['countAnswerQrl'];
        const testAnswerText = 'test answer';

        service.answerTextSetter = testAnswerText;

        expect(service['countAnswerQrl']).toEqual(initialCount + 1);
        expect(service['answerText']).toEqual(testAnswerText);
    });
    it('should call sendliveAnswer', () => {
        service['currentQuestionIndex'] = 0;
        const testAnswerText = 'test answer';
        service['countAnswerQrl'] = 2;
        service.answerTextSetter = testAnswerText;
        expect(socketServiceSpy.sendLiveAnswers).toHaveBeenCalled();
    });
    it('should call sendliveAnswer', () => {
        service['currentQuestionIndex'] = 1;
        const testAnswerText = 'test answer';
        service['countAnswerQrl'] = 1;
        service.answerTextSetter = testAnswerText;
        expect(socketServiceSpy.sendLiveAnswers).toHaveBeenCalled();
    });

    it('should return LAUNCH_TIMER_DURATION if launchTimer is true', () => {
        service['launchTimer'] = true;
        const result = service.totalQuestionDurationValue;
        expect(result).toBe(SOCKET_TIMER_DURATION);
    });
    it('should return QRL-timer-duration if currentQuestion is a QRL', () => {
        service['launchTimer'] = false;
        service['currentQuestion'] = {
            id: '123',
            type: QuestionType.QRL,
            text: 'test',
            points: 10,
            lastModification: date,
        };
        const result = service.totalQuestionDurationValue;
        expect(result).toBe(QRL_TIMER_DURATION);
    });

    it('should return totalQuestionDuration if launchTimer is false', () => {
        service['launchTimer'] = false;
        service['totalQuestionDuration'] = 100;
        const result = service.totalQuestionDurationValue;
        expect(result).toBe(service['totalQuestionDuration']);
    });

    it('should get currentQuestionValue', () => {
        const currentQuestionSpy = service['currentQuestion'];
        const result = service.currentQuestionValue;
        expect(result).toBe(currentQuestionSpy);
    });

    it('should get timerStoppedValue', () => {
        const timerStoppedSpy = service['timerStopped'];
        const result = service.timerStoppedValue;
        expect(result).toBe(timerStoppedSpy);
    });

    it('should get liveAnswersClickedValue', () => {
        const answersClickedSpy = service['answersClicked'];
        const result = service.liveAnswersClickedValue;
        expect(result).toBe(answersClickedSpy);
    });

    it('should get allQuestionsFromGameValue', () => {
        const allQuestionsFromGameSpy = service['allQuestionsFromGame'];
        const result = service.allQuestionsFromGameValue;
        expect(result).toBe(allQuestionsFromGameSpy);
    });

    it('should get allAnswersIndexValue', () => {
        const allAnswersIndexSpy = service['allAnswersIndex'];
        const result = service.allAnswersIndexValue;
        expect(result).toBe(allAnswersIndexSpy);
    });

    it('should get gameTitleValue', () => {
        const gameTitleSpy = service['gameTitle'];
        const result = service.gameTitleValue;
        expect(result).toBe(gameTitleSpy);
    });

    it('should get answersClickedValue', () => {
        const answersClickedSpy = service['answersClicked'];
        const result = service.answersClickedValue;
        expect(result).toBe(answersClickedSpy);
    });

    it('should set player name', () => {
        const playerName = 'John Doe';
        service.setPlayerName(playerName);
        expect(service.playerNameValue).toBe(playerName);
    });
    it('should set player qrl point', () => {
        const player: Player = {
            id: '111',
            bonus: 1,
            score: 2,
            name: 'test',
        };
        service['answersTextQRL'] = [['Question1', [[player, 'Answer1']]]];
        service['currentQRLIndex'] = 0;

        const numb1 = 2;
        const points: [Player, number][] = [[player, numb1]];
        service.playerQRLPoints = points;
        expect(service['pointsQRL']).toEqual(points);
    });

    it('should update player points qrl', () => {
        service.updatePointsQRL();
        expect(socketServiceSpy.updatePointsQRL).toHaveBeenCalled();
    });
    it('should set answer index', () => {
        // const player: Player = {
        //     id: '111',
        //     bonus: 1,
        //     score: 2,
        //     name: 'test',
        // };
        const answerIndex = [1, 2, 3];
        service.answerIndexSetter = answerIndex;
        expect(service['answerIndex']).toBe(answerIndex);
        expect(socketServiceSpy.sendLiveAnswers).toHaveBeenCalled();
    });

    it('should ban player', () => {
        const playerName = 'John Doe';
        service.banPlayer(playerName);
        expect(socketServiceSpy.banPlayer).toHaveBeenCalledWith(playerName);
    });

    it('should leave the room', fakeAsync(() => {
        service.leaveRoom();
        expect(socketServiceSpy.leaveRoom).toHaveBeenCalled();
        tick(WAIT_UNTIL_FIRE_DISCONNECTS);
        expect(socketServiceSpy.disconnect).toHaveBeenCalled();
    }));

    it('should reset game variables', () => {
        service.resetGameVariables();
        expect(service.lobbyCodeValue).toBe('');
        expect(service.playerListValue).toEqual([]);
        expect(service.isHostValue).toBeFalse();
        expect(service.roomIsLockedValue).toBeFalse();
        expect(service.currentQuestionValue).toBeNull();
        expect(service['answerIndex']).toEqual([]);
        expect(service.allQuestionsFromGameValue).toEqual([]);
        expect(service.allAnswersIndexValue).toEqual([]);
        expect(service.answersClickedValue).toEqual([]);
        expect(service.playerLeftListValue).toEqual([]);
    });

    it('should start game', () => {
        service.startGame();
        expect(socketServiceSpy.startGame).toHaveBeenCalled();
    });

    it('should call socketService.nextQuestion immediately if currentQuestionIndex + 1 equals nbrOfQuestions', fakeAsync(() => {
        service['currentQuestionIndex'] = 4;
        service['nbrOfQuestions'] = 5;
        service.nextQuestion();
        expect(socketServiceSpy.nextQuestion).toHaveBeenCalled();
    }));
    it('should call updatePointsQRL immediately if question is a qrl', fakeAsync(() => {
        spyOn(service, 'updatePointsQRL');
        service['currentQuestion'] = {
            id: '123',
            type: QuestionType.QRL,
            text: 'test',
            points: 2,
            lastModification: date,
        };
        service.nextQuestion();
        flush();
        expect(service.updatePointsQRL).toHaveBeenCalled();
    }));

    it('should call socketService.nextQuestion if last question not reached', fakeAsync(() => {
        service['currentQuestionIndex'] = 3;
        service['nbrOfQuestions'] = 5;
        service.nextQuestion();
        tick(TIME_BETWEEN_QUESTIONS);
        expect(socketServiceSpy.nextQuestion).toHaveBeenCalled();
    }));

    it('should submit answer', () => {
        service.submitAnswer();
        expect(socketServiceSpy.sendLockedAnswers).toHaveBeenCalled();
    });
    it('should submit answer if question is qrl', () => {
        service['currentQuestion'] = {
            id: '123',
            type: QuestionType.QRL,
            text: 'test',
            points: 2,
            lastModification: date,
        };
        service.submitAnswer();
        expect(socketServiceSpy.sendLockedAnswers).toHaveBeenCalled();
    });

    it('should set lobbyCode, isHost, and gameTitle when onRoomCreated is called', () => {
        socketServiceSpy.onRoomCreated.and.callFake((callback) => {
            callback('1234', 'Test Game', 1);
        });
        service.setupWebsocketEvents();
        expect(service['lobbyCode']).toBe('1234');
        expect(service['isHost']).toBe(true);
        expect(service['gameTitle']).toBe('Test Game');
        expect(socketServiceSpy.onRoomCreated).toHaveBeenCalled();
    });

    it('should set lobbyCode, isHost, and gameTitle when onRoomCreated is called', () => {
        socketServiceSpy.onRoomCreated.and.callFake((callback) => {
            callback('1234', 'Test Game', 2);
        });
        service.setupWebsocketEvents();
        expect(service['lobbyCode']).toBe('1234');
        expect(service['isHost']).toBe(true);
        expect(service['gameTitle']).toBe('Test Game');
        expect(socketServiceSpy.onRoomCreated).toHaveBeenCalled();
    });

    it('should set playerList and gameTitle when onRoomTestCreated is called', () => {
        const player: Player = { id: 'p1', name: 'Player 1', score: 0, bonus: 0 };
        socketServiceSpy.onRoomTestCreated.and.callFake((callback) => {
            const playerList: [[string, Player]] = [['1', player]];
            callback('Test Game', playerList);
        });
        service.setupWebsocketEvents();
        expect(service['playerList']).toEqual([player]);
        expect(service['gameTitle']).toBe('Test Game');
        expect(socketServiceSpy.onRoomTestCreated).toHaveBeenCalled();
    });

    it('should set timerCountdown when onTimerCountdown is called', () => {
        const timerCountdown = 10;
        socketServiceSpy.onTimerCountdown.and.callFake((callback) => {
            callback(timerCountdown);
        });
        service.setupWebsocketEvents();
        expect(service['timerCountdown']).toBe(timerCountdown);
        expect(socketServiceSpy.onTimerCountdown).toHaveBeenCalled();
    });
    it('should set playerList when onPlayerListChange is called', () => {
        const player: Player = { id: 'p1', name: 'Player 1', score: 0, bonus: 0 };
        socketServiceSpy.onPlayerListChange.and.callFake((callback) => {
            const playerList: [[string, Player]] = [['1', player]];
            callback(playerList);
        });
        service.setupWebsocketEvents();
        expect(service['playerList']).toEqual([player]);
        expect(socketServiceSpy.onPlayerListChange).toHaveBeenCalled();
    });

    it('should set playerLeftList when onPlayerLeftListChange is called', () => {
        const player: Player = { id: 'p1', name: 'Player 1', score: 0, bonus: 0 };
        socketServiceSpy.onPlayerLeftListChange.and.callFake((callback) => {
            const playerList: Player[] = [player];
            callback(playerList);
        });
        service.setupWebsocketEvents();
        expect(service['playerLeftList']).toEqual([player]);
        expect(socketServiceSpy.onPlayerLeftListChange).toHaveBeenCalled();
    });

    it('should call leaveRoom and disconnect when onLobbyDeleted is called', fakeAsync(() => {
        socketServiceSpy.onLobbyDeleted.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(socketServiceSpy.onLobbyDeleted).toHaveBeenCalled();
        tick(TIME_BETWEEN_QUESTIONS);
        expect(socketServiceSpy.disconnect).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('should set lobbyCode and gameTitle when onRoomJoined is called', () => {
        const player: Player = {
            id: '111',
            bonus: 1,
            score: 2,
            name: 'test',
        };
        socketServiceSpy.onRoomJoined.and.callFake((callback) => {
            callback('1234', 'Test Game', player);
        });
        service.setupWebsocketEvents();
        expect(service['lobbyCode']).toBe('1234');
        expect(service['gameTitle']).toBe('Test Game');
        expect(socketServiceSpy.onRoomJoined).toHaveBeenCalled();
    });

    it('should set roomLocked when onRoomLockStatus is called', () => {
        socketServiceSpy.onRoomLockStatus.and.callFake((callback) => {
            callback(true);
        });
        service.setupWebsocketEvents();
        expect(service['roomLocked']).toBeTrue();
        expect(socketServiceSpy.onRoomLockStatus).toHaveBeenCalled();
    });

    it('should call leaveRoom when onBannedFromGame is called', () => {
        const leaveRoomSpy = spyOn(service, 'leaveRoom');
        socketServiceSpy.onBannedFromGame.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(socketServiceSpy.onBannedFromGame).toHaveBeenCalled();
        expect(leaveRoomSpy).toHaveBeenCalled();
    });

    it('should set launchTimer when onGameLaunch is called', () => {
        socketServiceSpy.onGameLaunch.and.callFake((callback) => {
            const questionDuration = 10;
            const nbrOfQuestions = 5;
            callback(questionDuration, nbrOfQuestions);
        });
        service.setupWebsocketEvents();
        expect(service['launchTimer']).toBeTrue();
        expect(socketServiceSpy.onGameLaunch).toHaveBeenCalled();
    });
    it('should redirect to /host-game-page if isHost is true and if gameType is equal to 0 when onGameLaunch is called', () => {
        service['isHost'] = true;
        service['gameType'] = 0;
        const questionDuration = 10;
        const nbrOfQuestions = 5;
        service.gameLaunch(nbrOfQuestions, questionDuration);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/host-game-page']);
    });

    it('should call gameLAauch on gameLaunch', () => {
        spyOn(service, 'gameLaunch');
        service['isHost'] = true;
        service['gameType'] = 0;
        socketServiceSpy.onGameLaunch.and.callFake((callback) => {
            const questionDuration = 10;
            const nbrOfQuestions = 5;
            callback(questionDuration, nbrOfQuestions);
        });
        service.setupWebsocketEvents();
        expect(service.gameLaunch).toHaveBeenCalled();
    });

    it('should call gameLaunch when onGameLaunch is called', () => {
        spyOn(service, 'gameLaunch');
        service['isHost'] = true;
        socketServiceSpy.onGameLaunch.and.callFake((callback) => {
            const questionDuration = 10;
            const nbrOfQuestions = 5;
            callback(questionDuration, nbrOfQuestions);
        });
        service.setupWebsocketEvents();
        expect(service.gameLaunch).toHaveBeenCalled();
        // expect(routerSpy.navigate).toHaveBeenCalledWith(['/host-game-page']);
    });

    it('should set currentQuestionIndex, nbrOfQuestions, and totalQuestionDuration when onQuestion is called', () => {
        const question: Question = {
            type: QuestionType.QCM,
            text: 'The Earth is flat.',
            points: 20,
            choices: [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: true },
            ],
            lastModification: new Date(),
            id: 'def',
        };
        socketServiceSpy.onQuestion.and.callFake((callback) => {
            callback(question, 0);
        });
        service.setupWebsocketEvents();
        expect(service['currentQuestionIndex']).toBe(0);
        expect(service['currentQuestion']).toEqual(question);
        expect(socketServiceSpy.onQuestion).toHaveBeenCalled();
    });

    it('should set currentQuestionIndex when onQuestionTimeUpdated is called', () => {
        socketServiceSpy.onQuestionTimeUpdated.and.callFake((callback) => {
            callback(2);
        });
        service.setupWebsocketEvents();
        expect(service['totalQuestionDuration']).toBe(2);
    });

    it('should set timerStopped when onTimerStopped is called with qrl question', () => {
        service['currentQuestion'] = {
            id: '123',
            type: QuestionType.QRL,
            text: 'test',
            points: 2,
            lastModification: date,
        };
        socketServiceSpy.onTimerStopped.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(service['timerStopped']).toBeTrue();
        expect(socketServiceSpy.onTimerStopped).toHaveBeenCalled();
    });
    it('should set timerStopped when onTimerStopped is called', () => {
        socketServiceSpy.onTimerStopped.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(service['timerStopped']).toBeTrue();
        expect(socketServiceSpy.onTimerStopped).toHaveBeenCalled();
    });
    it('should set answersQRLtext when onlockedAnswersQRL is called', () => {
        const player: Player = {
            id: '111',
            bonus: 1,
            score: 2,
            name: 'test',
        };
        const testAnswers: [string, [Player, string][]][] = [['Question1', [[player, 'Answer1']]]];
        socketServiceSpy.onLockedAnswersQRL.and.callFake((callback) => {
            callback(testAnswers);
        });
        service.setupWebsocketEvents();
        expect(service['answersTextQRL']).toBe(testAnswers);
    });

    it('should set nbInputModification when onUpdateNBModified is called', () => {
        const nbModified = 3;
        socketServiceSpy.onUpdateNbModified.and.callFake((callback) => {
            callback(nbModified);
        });
        service.setupWebsocketEvents();
        // expect(service['timerStopped']).toBeTrue();
        expect(service['numberInputModified']).toBe(nbModified);
    });

    it('should set answersClicked when onLivePlayerAnswers is called', () => {
        const player: Player = {
            id: '111',
            bonus: 1,
            score: 2,
            name: 'test',
        };
        const answers: [string, number[]][] = [
            ['Player 1', [1, 2]],
            ['Player 2', [0, 3]],
        ];
        socketServiceSpy.onLivePlayerAnswers.and.callFake((callback) => {
            callback(answers, player);
        });
        service.setupWebsocketEvents();
        expect(service['answersClicked']).toEqual(answers);
        expect(socketServiceSpy.onLivePlayerAnswers).toHaveBeenCalled();
    });

    it('should navigate to /game-result when onGoToResult is called', () => {
        const player: Player = { id: 'p1', name: 'Player 1', score: 0, bonus: 0 };
        const question: Question = {
            type: QuestionType.QCM,
            text: 'The Earth is flat.',
            points: 20,
            choices: [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: true },
            ],
            lastModification: new Date(),
            id: 'def',
        };
        const answers: [string, number[]][] = [
            ['Player 1', [1, 2]],
            ['Player 2', [0, 3]],
        ];
        socketServiceSpy.onGoToResult.and.callFake((callback) => {
            const playerList: [[string, Player]] = [['1', player]];
            callback(playerList, [question], answers);
        });
        service.setupWebsocketEvents();
        expect(service['playerList']).toEqual([player]);
        expect(service['allQuestionsFromGame']).toEqual([question]);
        expect(service['allAnswersIndex']).toEqual(answers);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/resultsView']);
        expect(socketServiceSpy.onGoToResult).toHaveBeenCalled();
    });

    it('should call pauseTimer from socketService when pauseTimer is called', () => {
        const value = service['gameTimerPaused'];
        service.pauseTimer();
        expect(service['gameTimerPaused']).toBe(!value);
        expect(socketServiceSpy.pauseTimer).toHaveBeenCalled();
    });

    it('should call enablePanicMode from socketService when enablePanicMode is called', () => {
        service.enablePanicMode();
        expect(socketServiceSpy.enablePanicMode).toHaveBeenCalled();
    });

    it('should call audio.play when onPanicModeEnabled is called', () => {
        spyOn(service['audio'], 'play');
        socketServiceSpy.onPanicModeEnabled.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(socketServiceSpy.onPanicModeEnabled).toHaveBeenCalled();
        expect(service['audio'].play).toHaveBeenCalled();
    });

    it('should call audio.pause when onPanicModeDisabled is called', () => {
        spyOn(service['audio'], 'pause');
        socketServiceSpy.onPanicModeDisabled.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(socketServiceSpy.onPanicModeDisabled).toHaveBeenCalled();
        expect(service['audio'].pause).toHaveBeenCalled();
        expect(service['audio'].currentTime).toBe(0);
    });

    it('should return game type', () => {
        const gameTypeValueSpy = service['gameTypeValue'];
        const result = service.gameTypeValue;
        expect(result).toBe(gameTypeValueSpy);
    });

    it('should call audio.pause when onPanicModeDisabled is called', () => {
        spyOn(service['audio'], 'pause');
        socketServiceSpy.onPanicModeDisabled.and.callFake((callback) => {
            callback();
        });
        service.setupWebsocketEvents();
        expect(socketServiceSpy.onPanicModeDisabled).toHaveBeenCalled();
        expect(service['audio'].pause).toHaveBeenCalled();
        expect(service['audio'].currentTime).toBe(0);
    });
});
