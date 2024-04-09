import { GameType, Room } from '@app/classes/room';
import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;
const QUARTER_SECOND_IN_MS = 250;
const TIME_BETWEEN_QUESTIONS_TEST_MODE = 3000;
// const BEGINNING_TIMER_DURATION = 5;

export const enum TimerState {
    RUNNING,
    STOPPED,
    PAUSED,
}

export class CountdownTimer {
    private room: Room;
    private io: SocketIoServer;
    private roomId: string;
    private currentCountdownTime: number;
    private timerDuration: number;
    private timerId: number;
    private timerState: TimerState = TimerState.STOPPED;
    private isLaunchTimer: boolean = true;
    private panicModeEnabled: boolean = false;
    private currentQuestionIsQRL: boolean;

    constructor(room: Room) {
        this.room = room;
        this.io = room.io;
        this.roomId = room.roomId;
    }

    get timerStateValue(): TimerState {
        return this.timerState;
    }

    get isLaunchTimerValue(): boolean {
        return this.isLaunchTimer;
    }

    set timerDurationValue(value: number) {
        this.timerDuration = value;
        this.io.to(this.roomId).emit('question-time-updated', this.timerDuration);
    }

    set currentQuestionIsQRLValue(value: boolean) {
        this.currentQuestionIsQRL = value;
    }

    startCountdownTimer(): void {
        this.timerState = TimerState.RUNNING;
        this.currentCountdownTime = this.timerDuration;
        this.io.to(this.roomId).emit('timer-countdown', this.timerDuration);
        const timerId = setInterval(
            () => {
                if (this.timerState !== TimerState.PAUSED) {
                    this.currentCountdownTime -= 1;
                    this.io.to(this.roomId).emit('timer-countdown', this.currentCountdownTime);
                    if (this.currentCountdownTime === 0) {
                        // TODO: Check if I can move this elsewhere
                        this.room.firstAnswerForBonus = false;
                        if (!this.isLaunchTimer) {
                            this.io.to(this.roomId).emit('timer-stopped');
                        }
                        this.handleTimerEnd();
                    }
                }
            },
            ONE_SECOND_IN_MS,
            this.currentCountdownTime,
        );
        this.timerId = timerId;
    }

    handleTimerEnd(): void {
        clearInterval(this.timerId);
        this.timerDuration = this.room.gameDurationValue;
        if (this.panicModeEnabled) {
            this.io.to(this.roomId).emit('panic-mode-disabled');
            this.panicModeEnabled = false;
        }
        this.timerState = TimerState.STOPPED;
        if (this.isLaunchTimer) {
            this.isLaunchTimer = false;
            // this.io.to(this.roomId).emit('question-time-updated', this.room.gameDurationValue);
            // this.timerDuration = this.room.gameDurationValue;
            this.room.startQuestion();
            return;
        }
        if (this.room.gameTypeValue === GameType.TEST || this.room.gameTypeValue === GameType.RANDOM) {
            setTimeout(() => {
                this.room.startQuestion();
            }, TIME_BETWEEN_QUESTIONS_TEST_MODE);
        }
    }

    handleTimerPause(): void {
        if (this.timerState === TimerState.RUNNING) {
            this.timerState = TimerState.PAUSED;
        } else if (this.timerState === TimerState.PAUSED) {
            this.timerState = TimerState.RUNNING;
        }
    }

    handlePanicMode(): void {
        // eslint-disable-next-line
        const MINIMAL_TIME_FOR_PANIC_MODE = this.currentQuestionIsQRL ? 20 : 10;
        if (this.timerState === TimerState.RUNNING && this.currentCountdownTime <= MINIMAL_TIME_FOR_PANIC_MODE && !this.isLaunchTimer) {
            this.panicModeEnabled = true;
            this.io.to(this.roomId).emit('panic-mode-enabled');
            clearInterval(this.timerId);
            const timerId = setInterval(
                () => {
                    if (this.timerState !== TimerState.PAUSED) {
                        this.currentCountdownTime -= 1;
                        this.io.to(this.roomId).emit('timer-countdown', this.currentCountdownTime);
                        if (this.currentCountdownTime === 0) {
                            this.room.firstAnswerForBonus = false;
                            this.io.to(this.roomId).emit('timer-stopped');
                            this.handleTimerEnd();
                        }
                    }
                },
                QUARTER_SECOND_IN_MS,
                this.currentCountdownTime,
            );
            this.timerId = timerId;
        }
    }
}
