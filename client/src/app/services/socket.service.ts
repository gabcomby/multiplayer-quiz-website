// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    private readonly url: string = 'http://localhost:3000';

    connect(): string[] {
        console.log('connecthu');
        this.socket = io(this.url, { autoConnect: true });
        let arrayM: string[] = [];
        this.socket.on('messageConnect', (mesage) => {
            // eslint-disable-next-line no-console
            arrayM.push(mesage);
        });
        return arrayM;
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

    async deleteId(): Promise<string> {
        return new Promise<string>((resolve) => {
            console.log('deletehu');
            this.socket = io(this.url, { autoConnect: true });
            console.log('deletehu2');
            this.socket.on('deleteId', (gameId) => {
                console.log('socketcalled');
                resolve(gameId);
            });
        });
    }
}
