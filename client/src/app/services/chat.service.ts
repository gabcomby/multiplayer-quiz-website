import { Injectable } from '@angular/core';
import type { Message } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { Observable, Subject } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private messages: Message[] = [];
    private newMessage = new Subject<Message>();

    constructor(
        private socket: SocketService,
        private snackbar: SnackbarService,
    ) {
        this.listenForMessages();
    }

    getMessages(): Observable<Message[]> {
        return new Observable((observer) => {
            observer.next(this.messages);
        });
    }

    getNewMessage(): Observable<Message> {
        return this.newMessage.asObservable();
    }

    sendMessage(text: string, sender: string, roomId: string, isHost: boolean, playerName: string): void {
        const trimmedText = text.trim();
        if (!isHost && !playerName) {
            this.snackbar.openSnackBar('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
            return;
        }

        if (trimmedText) {
            const newMessage: Message = {
                text: trimmedText,
                sender: isHost ? 'Organisateur' : playerName,
                timestamp: new Date(),
                visible: true,
            };

            this.messages.push(newMessage);
            this.newMessage.next(newMessage);
            this.socket.sendMessageToServer(trimmedText, isHost ? 'Organisateur' : playerName, roomId);
        }
    }

    hideMessage(index: number): void {
        if (index >= 0 && index < this.messages.length) {
            this.messages[index].visible = false;
            this.newMessage.next(this.messages[index]);
        }
    }

    private listenForMessages(): void {
        this.socket.onChatMessage().subscribe({
            next: (message: Message) => {
                const newMessage = { ...message, timestamp: message.timestamp ? new Date(message.timestamp) : new Date(), visible: true };
                this.messages.push(newMessage);
                this.newMessage.next(newMessage);
            },
            error: () => this.snackbar.openSnackBar('Pas de salle, vos messages ne seront pas envoyés'),
        });
    }
}
