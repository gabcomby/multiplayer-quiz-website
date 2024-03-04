// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import type { Choice } from '@app/interfaces/game';
// import { environment } from '@env/environment.prod';
import { environment } from '@env/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    // private readonly url: string = environment.serverUrl;
    private readonly url: string = environment.socketUrl;

    connect(): string[] {
        this.socket = io(this.url, { autoConnect: true });
        const arrayM: string[] = [];
        this.socket.on('messageConnect', (mesage) => {
            arrayM.push(mesage);
        });
        return arrayM;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    async deleteId(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.socket = io(this.url, { autoConnect: true });
            this.socket.on('deleteId', (gameId) => {
                resolve(gameId);
            });
        });
    }

    verifyAnswers(choices: Choice[] | undefined, answerIdx: number[]) {
        this.socket.emit('assert-answers', choices, answerIdx);
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

    onTimerCountdown(callback: (data: number) => void): void {
        this.socket.on('timer-countdown', (data: number) => {
            callback(data);
        });
    }

    onAnswerVerification(callback: (data: boolean) => void): void {
        this.socket.on('answer-verification', (data: boolean) => {
            callback(data);
        });
    }
}
