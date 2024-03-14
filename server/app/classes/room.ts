import { IGame } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import type { AnswersPlayer } from '@app/model/questions.model';
import { customAlphabet } from 'nanoid';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;
const ID_LOBBY_LENGTH = 4;

export class Room {
    io: SocketIoServer;
    roomId = '';
    playerList = new Map<string, IPlayer>();
    playerLeftList: string[] = [];
    game: IGame;
    bannedNames: string[] = [];
    roomLocked = false;
    hostId = '';
    launchTimer = true;
    // eslint-disable-next-line
    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;
    currentQuestionIndex = 0;

    livePlayerAnswers = new Map<string, number[]>();
    player = new Map<string, string>();
    score = new Map<string, number>();
    assertedAnswers: number = 0;
    answersLocked = 0;
    firstAnswer = true;
    playersAnswers: AnswersPlayer[] = [];

    constructor(game: IGame, io: SocketIoServer) {
        this.roomId = this.generateLobbyId();
        this.game = game;
        this.io = io;
    }

    startQuestion(): void {
        if (!this.isRunning) {
            if (this.launchTimer) {
                this.duration = 5;
                this.isRunning = true;
                this.startCountdownTimer();
            } else {
                this.io.to(this.roomId).emit('question', this.game.questions[this.currentQuestionIndex]);
                this.isRunning = true;
                this.startCountdownTimer();
            }
        }
    }

    startCountdownTimer(): void {
        this.currentTime = this.duration;
        this.io.to(this.roomId).emit('timer-countdown', this.duration);
        const timerId = setInterval(
            () => {
                this.currentTime -= 1;
                this.io.to(this.roomId).emit('timer-countdown', this.currentTime);
                if (this.currentTime === 0) {
                    this.io.to(this.roomId).emit('timer-stopped');
                    this.io.to(this.roomId).emit('question-time-updated', this.game.duration);
                    this.handleTimerEnd();
                }
            },
            ONE_SECOND_IN_MS,
            this.currentTime,
        );
        this.timerId = timerId;
    }

    handleTimerEnd(): void {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.currentTime = this.duration;
        this.answersLocked = 0;
        if (this.launchTimer) {
            this.launchTimer = false;
            this.duration = this.game.duration;
            this.startQuestion();
        } else {
            this.currentQuestionIndex += 1;
        }
    }

    generateLobbyId = (): string => {
        const nanoid = customAlphabet('1234567890', ID_LOBBY_LENGTH);
        return nanoid();
    };
}
