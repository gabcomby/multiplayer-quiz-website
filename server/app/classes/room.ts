import { IGame } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import type { AnswersPlayer } from '@app/model/questions.model';
import { customAlphabet } from 'nanoid';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;
const ID_LOBBY_LENGTH = 4;

export class Room {
    roomId = '';
    playerList = new Map<string, IPlayer>();
    playerLeftList: string[] = [];
    game: IGame;
    bannedNames: string[] = [];
    roomLocked = false;
    hostId = '';

    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;
    livePlayerAnswers = new Map<string, number[]>();
    player = new Map<string, string>();
    score = new Map<string, number>();
    assertedAnswers: number = 0;
    answersLocked = 0;
    firstAnswer = true;
    playersAnswers: AnswersPlayer[] = [];

    constructor(game: IGame) {
        this.roomId = this.generateLobbyId();
        // Promise.resolve(this.gameService.getGame(gameId)).then((game) => {
        //     this.game = game;
        // });
        this.game = game;
    }

    startCountdownTimer(io: SocketIoServer, roomId: string): void {
        this.currentTime = this.duration;
        io.to(roomId).emit('timer-countdown', this.duration);
        const timerId = setInterval(
            () => {
                this.currentTime -= 1;
                io.to(roomId).emit('timer-countdown', this.currentTime);
                if (this.currentTime === 0) {
                    io.to(roomId).emit('stop-timer');
                    this.resetTimerCountdown();
                }
            },
            ONE_SECOND_IN_MS,
            this.currentTime,
        );
        this.timerId = timerId;
    }

    resetTimerCountdown(): void {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.currentTime = this.duration;
        this.answersLocked = 0;
    }

    generateLobbyId = (): string => {
        const nanoid = customAlphabet('1234567890', ID_LOBBY_LENGTH);
        return nanoid();
    };
}
