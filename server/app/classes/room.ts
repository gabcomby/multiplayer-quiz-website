import { AnswerVerifier } from '@app/classes/answer-verifier';
import { CountdownTimer, TimerState } from '@app/classes/countdown-timer';
import { IGame, IQuestion } from '@app/model/game.model';
import { IGamePlayed } from '@app/model/gameplayed.model';
import { IPlayer } from '@app/model/match.model';
import { GamePlayedService } from '@app/services/game-played.service';
import { customAlphabet } from 'nanoid';
import { Server as SocketIoServer } from 'socket.io';

const ID_LOBBY_LENGTH = 4;
const ID_GAME_PLAYED_LENGTH = 10;
const TIME_HISTOGRAM_UPDATE = 5000;
const NOT_FOUND_INDEX = -1;
const LAUNCH_TIMER_DURATION = 5;

export const enum GameType {
    NORMAL,
    TEST,
    RANDOM,
}

export class Room {
    gamePlayedService: GamePlayedService;
    countdownTimer: CountdownTimer;
    answerVerifier: AnswerVerifier;
    io: SocketIoServer;
    roomId = '';
    playerList = new Map<string, IPlayer>();
    playerLeftList: IPlayer[] = [];
    game: IGame;
    bannedNames: string[] = [];
    roomLocked = false;
    hostId = '';
    gameType: GameType;
    gameHasStarted = false;
    gameStartDateTime: Date;
    nbrPlayersAtStart: number;
    inputModifications: { player: string; time: number }[] = [];
    currentQuestionIndex = NOT_FOUND_INDEX;
    lockedAnswers: number = 0;
    playerHasAnswered = new Map<string, boolean>();
    livePlayerAnswers = new Map<string, number[] | string>();

    constructor(game: IGame, gameMode: number, io: SocketIoServer) {
        this.roomId = this.generateLobbyId();
        this.game = game;
        switch (gameMode) {
            case 0:
                this.gameType = GameType.NORMAL;
                break;
            case 1:
                this.gameType = GameType.TEST;
                break;
            case 2:
                this.gameType = GameType.RANDOM;
                break;
            default:
                this.gameType = GameType.NORMAL;
        }
        this.io = io;
        this.gamePlayedService = new GamePlayedService();
        this.countdownTimer = new CountdownTimer(this);
        this.answerVerifier = new AnswerVerifier(this);
    }

    get gameTypeValue(): GameType {
        return this.gameType;
    }

    get gameDurationValue(): number {
        return this.game.duration;
    }

    get currentQuestion(): IQuestion {
        return this.game.questions[this.currentQuestionIndex];
    }

    get playerListValue(): Map<string, IPlayer> {
        return this.playerList;
    }

    disableFirstAnswerBonus(): void {
        this.answerVerifier.firstAnswerForBonusValue = false;
    }

    startQuestion(): void {
        this.inputModifications = [];
        if (this.countdownTimer.timerStateValue === TimerState.STOPPED) {
            if (this.countdownTimer.isLaunchTimerValue) {
                this.countdownTimer.timerDurationValue = LAUNCH_TIMER_DURATION;
                this.countdownTimer.startCountdownTimer();
            } else {
                this.currentQuestionIndex += 1;
                // Moves to game results and writes into DB
                if (this.currentQuestionIndex === this.game.questions.length) {
                    this.io
                        .to(this.roomId)
                        .emit(
                            'go-to-results',
                            Array.from(this.playerList),
                            this.game.questions,
                            Array.from(this.answerVerifier.allAnswersGameResultsValue),
                        );
                    if (this.gameType !== GameType.TEST) {
                        const gamePlayedData: IGamePlayed = {
                            id: this.generateGamePlayedId(),
                            title: this.game.title,
                            creationDate: this.gameStartDateTime,
                            numberPlayers: this.nbrPlayersAtStart,
                            bestScore: Math.max(...Array.from(this.playerList).map(([, player]) => player.score)),
                        } as IGamePlayed;
                        this.gamePlayedService.createGamePlayed(gamePlayedData);
                    }
                }
                // Moves to next question
                else {
                    this.io.to(this.roomId).emit('question', this.game.questions[this.currentQuestionIndex], this.currentQuestionIndex);
                    if (this.game.questions[this.currentQuestionIndex]?.type === 'QRL') {
                        this.countdownTimer.timerDurationValue = 60;
                        this.countdownTimer.currentQuestionIsQRLValue = true;
                    } else {
                        this.countdownTimer.timerDurationValue = this.game.duration;
                        this.countdownTimer.currentQuestionIsQRLValue = false;
                    }
                    // Reset question logic variables
                    this.lockedAnswers = 0;
                    this.answerVerifier.firstAnswerForBonusValue = true;
                    this.answerVerifier.nbrOfAssertedAnswersValue = 0;
                    this.playerHasAnswered.forEach((value, key) => {
                        this.playerHasAnswered.set(key, false);
                    });
                    this.answerVerifier.playerHasAnsweredSetter = this.playerHasAnswered;
                    this.livePlayerAnswers.forEach((value, key) => {
                        this.livePlayerAnswers.set(key, []);
                    });
                    this.countdownTimer.startCountdownTimer();
                }
            }
        }
    }

    handleEarlyAnswers(playerId: string, answer: number[] | string, player: IPlayer): void {
        this.lockedAnswers += 1;
        this.answerVerifier.verifyAnswers(playerId, answer, player);
        if (this.lockedAnswers === this.playerList.size) {
            this.io.to(this.roomId).emit('timer-stopped');
            this.countdownTimer.handleTimerEnd();
        }
    }

    handleInputModification() {
        if (this.game.questions[this.currentQuestionIndex]?.type === 'QCM') {
            return;
        }
        const now = new Date().getTime();
        const fiveSecondsAgo = now - TIME_HISTOGRAM_UPDATE;

        this.inputModifications = this.inputModifications.filter((modification) => modification.time > fiveSecondsAgo);

        const uniquePlayerIds = new Set(this.inputModifications.map((mod) => mod.player));
        const numberModifications = uniquePlayerIds.size;
        this.io.to(this.hostId).emit('number-modifications', numberModifications);
    }
    generateLobbyId = (): string => {
        const nanoid = customAlphabet('1234567890', ID_LOBBY_LENGTH);
        return nanoid();
    };
    generateGamePlayedId = (): string => {
        const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRTSUVWXYZ', ID_GAME_PLAYED_LENGTH);
        return nanoid();
    };
}
