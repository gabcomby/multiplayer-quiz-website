import type { AnswersPlayer } from '@app/model/questions.model';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;

export class Room {
    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;
    idAdmin = '';
    livePlayerAnswers = new Map<string, number[]>();
    player = new Map<string, string>();
    score = new Map<string, number>();
    assertedAnswers: number = 0;
    answersLocked = 0;
    roomId = '';
    firstAnswer = true;
    playersAnswers: AnswersPlayer[] = [];

    constructor(roomId: string) {
        this.roomId = roomId;
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
}
