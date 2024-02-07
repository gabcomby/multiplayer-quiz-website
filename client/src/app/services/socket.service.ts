// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    private readonly url: string = 'http://localhost:3000';

    connect(): void {
        this.socket = io(this.url, { autoConnect: true });
        this.socket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('Connected to Socket.IO server');
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    sendMessage(message: string): void {
        this.socket.emit('message', message);
    }

    onMessage(): void {
        this.socket.on('message', (data: unknown) => {
            // eslint-disable-next-line no-console
            console.log(data);
        });
    }

    setTimerDuration(duration: number): void {
        this.socket.emit('set-timer-duration', duration);
    }

    startTimer(): void {
        this.socket.emit('start-timer');
    }

    stopTimer(): void {
        this.socket.emit('stop-timer');
    }

    onTimerDuration(): unknown {
        let dataOut: unknown;
        this.socket.on('timer-duration', (data: unknown) => {
            // eslint-disable-next-line no-console
            console.log(data);
            dataOut = data;
        });
        return dataOut;
    }

    onTimerUpdate(): void {
        this.socket.on('timer-update', (data: unknown) => {
            // eslint-disable-next-line no-console
            console.log(data);
        });
    }

    onTimerCountdown(): number {
        let countdown = 0;
        this.socket.on('timer-countdown', (data: number) => {
            // eslint-disable-next-line no-console
            countdown = data;
        });
        return countdown;
    }
}
