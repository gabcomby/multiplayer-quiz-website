import { IGame } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import type { AnswersPlayer } from '@app/model/questions.model';
import { customAlphabet } from 'nanoid';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;
const ID_LOBBY_LENGTH = 4;
const FIRST_ANSWER_MULTIPLIER = 1.2;

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
    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Needed to not overflow the array and keep minimal code recycling
    currentQuestionIndex = -1;
    firstAnswerForBonus = true;
    assertedAnswers: number = 0;
    playerHasAnswered = new Map<string, boolean>();
    lockedAnswers = 0;
    livePlayerAnswers = new Map<string, number[]>();

    player = new Map<string, string>();
    score = new Map<string, number>();
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
                this.currentQuestionIndex += 1;
                if (this.currentQuestionIndex === this.game.questions.length) {
                    this.io.to(this.roomId).emit('go-to-results', Array.from(this.playerList), this.game.questions);
                } else {
                    this.firstAnswerForBonus = true;
                    this.assertedAnswers = 0;
                    this.io.to(this.roomId).emit('question', this.game.questions[this.currentQuestionIndex], this.currentQuestionIndex);
                    this.isRunning = true;
                    this.playerHasAnswered.forEach((value, key) => {
                        this.playerHasAnswered.set(key, false);
                    });
                    this.livePlayerAnswers.forEach((value, key) => {
                        this.livePlayerAnswers.set(key, []);
                    });
                    this.startCountdownTimer();
                }
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
                    this.firstAnswerForBonus = false;
                    if (!this.launchTimer) {
                        this.io.to(this.roomId).emit('timer-stopped');
                    }
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
        this.lockedAnswers = 0;
        if (this.launchTimer) {
            this.launchTimer = false;
            this.io.to(this.roomId).emit('question-time-updated', this.game.duration);
            this.duration = this.game.duration;
            this.startQuestion();
        }
    }

    verifyAnswers(playerId: string, answerIdx: number[]): void {
        if (!answerIdx || this.playerHasAnswered.get(playerId)) {
            return;
        }
        this.playerHasAnswered.set(playerId, true);
        const question = this.game.questions[this.currentQuestionIndex];
        this.assertedAnswers += 1;
        if (answerIdx.length === 0) {
            return;
        }
        const totalCorrectChoices = question.choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
        const isMultipleAnswer = totalCorrectChoices > 1;
        let isCorrect = false;
        if (!isMultipleAnswer) {
            isCorrect = question.choices[answerIdx[0]].isCorrect;
        } else {
            for (const index of answerIdx) {
                if (!question.choices[index].isCorrect) {
                    isCorrect = false;
                    break;
                }
                isCorrect = true;
            }
        }
        if (isCorrect && this.firstAnswerForBonus) {
            this.firstAnswerForBonus = false;
            this.playerList.get(playerId).score += question.points * FIRST_ANSWER_MULTIPLIER;
            this.playerList.get(playerId).bonus += 1;
        } else if (isCorrect) {
            this.playerList.get(playerId).score += question.points;
        }
        if (this.assertedAnswers === this.playerList.size) {
            this.io.to(this.roomId).emit('playerlist-change', Array.from(this.playerList));
        }
    }

    handleEarlyAnswers(playerId: string, answerIdx: number[]): void {
        this.lockedAnswers += 1;
        this.verifyAnswers(playerId, answerIdx);
        if (this.lockedAnswers === this.playerList.size) {
            this.io.to(this.roomId).emit('timer-stopped');
            this.handleTimerEnd();
        }
    }

    generateLobbyId = (): string => {
        const nanoid = customAlphabet('1234567890', ID_LOBBY_LENGTH);
        return nanoid();
    };
}
