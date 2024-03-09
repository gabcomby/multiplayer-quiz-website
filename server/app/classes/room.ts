import { Server as SocketIoServer } from 'socket.io';

const ONE_SECOND_IN_MS = 1000;

export class Room {
    duration = 0;
    timerId = 0;
    currentTime = 0;
    isRunning = false;
    idAdmin = '';
    player = new Map();
    answersLocked = 0;
    roomId = '';

    constructor(roomId: string) {
        this.roomId = roomId;
    }

    startCountdownTimer(io: SocketIoServer, roomId: string): void {
        this.currentTime = this.duration;
        io.emit('timer-countdown', this.duration);
        const timerId = setInterval(
            () => {
                this.currentTime -= 1;
                io.to(roomId).emit('timer-countdown', this.currentTime);
            },
            ONE_SECOND_IN_MS,
            this.currentTime,
        );
        this.timerId = timerId;
    }
}
