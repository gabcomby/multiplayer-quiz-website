// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import type { Choice } from '@app/interfaces/game';
import { environment } from '@env/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
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
    deletedGame(callback: (gameId: string) => void) {
        this.socket.on('deleteId', (gameId: string) => {
            callback(gameId);
        });
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
    startGame(): void {
        this.socket.emit('start');
    }
    onTimerGame(callback: () => void): void {
        this.socket.on('game-timer', () => {
            callback();
        });
    }
    onDisconnect(callback: () => void): void {
        this.socket.on('adminDisconnected', () => {
            callback();
        });
    }
    adminCreated(idAdmin: string): void {
        this.socket.emit('registerAsAdmin', idAdmin);
    }
    playerCreated(idPlayer: string): void {
        this.socket.emit('registerAsPlayer', idPlayer);
    }
    onPlayerDisconnect(callback: () => void) {
        this.socket.on('playerDisconnected', () => {
            callback();
        });
    }
}
