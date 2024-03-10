import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { SocketService } from './socket.service';

const MESSAGE_MAX_LENGTH = 200;
const DISAPPEAR_DELAY = 10000;
const MESSAGE_NOT_FOUND = -1;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private messages: { text: string; sender: string; visible: boolean; timestamp: string }[] = [];
    private messagesSubject = new Subject<{ text: string; sender: string; visible: boolean; timestamp: string }[]>();

    constructor(
        private socketService: SocketService,
        private snackbar: SnackbarService,
    ) {
        this.setupWebSocketEvents();
    }

    sendMessage(newMessage: string, playerName: string, isHost: boolean): void {
        const trimmedMessage = newMessage.trim();

        if (trimmedMessage.length === 0) {
            this.snackbar.openSnackBar('Votre message est vide.');
            return;
        }

        if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
            this.snackbar.openSnackBar('Votre message est trop long.');
            return;
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedMessage = isHost ? '[Organisateur] ' + playerName : playerName;
        this.broadcastMessage(trimmedMessage, formattedMessage, currentTime);
        this.socketService.sendMessages(trimmedMessage, playerName, isHost);
    }

    hideMessage(message: { text: string; sender: string; visible: boolean; timestamp: string }): void {
        const index = this.messages.indexOf(message);
        if (index !== MESSAGE_NOT_FOUND) {
            this.messages.splice(index, 1);
            this.messagesSubject.next(this.messages);
        }
    }

    getMessages(): Observable<{ text: string; sender: string; visible: boolean; timestamp: string }[]> {
        return this.messagesSubject.asObservable();
    }

    private broadcastMessage(message: string, sender: string, timestamp: string): void {
        this.messages.push({ text: message, sender, visible: true, timestamp });
        setTimeout(() => this.hideMessage(this.messages[this.messages.length - 1]), DISAPPEAR_DELAY);
        this.messagesSubject.next(this.messages);
    }

    private setupWebSocketEvents(): void {
        this.socketService.onChatMessage().subscribe(({ text, sender, timestamp }) => {
            this.broadcastMessage(text, sender, timestamp);
        });
    }
}
