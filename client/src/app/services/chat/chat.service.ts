import { Injectable } from '@angular/core';
import type { ChatMessageCommand, Message } from '@app/interfaces/message';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { BehaviorSubject, Subscription } from 'rxjs';

const DISAPPEAR_DELAY = 60000;
const NOT_FOUND_INDEX = -1;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messagesSubject = new BehaviorSubject<Message[]>([]);
    messages$ = this.messagesSubject.asObservable();

    private messages: Message[] = [];
    private listenToMessageSubscription: Subscription | undefined;

    constructor(
        private snackbar: SnackbarService,
        private socket: SocketService,
    ) {}

    listenForMessages(): void {
        this.listenToMessageSubscription = this.socket.onChatMessage().subscribe({
            next: (message) => this.handleNewMessage(message),
            error: () => this.snackbar.openSnackBar('Pas de salle, vos messages ne seront pas envoyés'),
        });
    }

    stopListeningForMessages(): void {
        this.listenToMessageSubscription?.unsubscribe();
    }
    resetMessages(): void {
        this.messagesSubject = new BehaviorSubject<Message[]>([]);
        this.messages$ = this.messagesSubject.asObservable();
        this.messages = [];
    }

    sendMessage(chatMessageCommand: ChatMessageCommand): void {
        const trimmedText = chatMessageCommand.text.trim();
        if (!chatMessageCommand.isHost && !chatMessageCommand.playerName) {
            this.snackbar.openSnackBar('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
            return;
        }

        if (trimmedText) {
            const message: Message = {
                text: trimmedText,
                sender: chatMessageCommand.isHost ? 'Organisateur' : chatMessageCommand.playerName,
                timestamp: new Date(),
                visible: true,
            };
            this.handleNewMessage(message);
            this.socket.sendMessageToServer(trimmedText, message.sender, chatMessageCommand.roomId);
        }
    }

    private handleNewMessage(message: Message): void {
        const newMessage = { ...message, timestamp: new Date(message.timestamp as unknown as string), visible: true };
        this.messages.push(newMessage);
        this.messagesSubject.next(this.messages);
        setTimeout(() => this.hideMessage(newMessage), DISAPPEAR_DELAY);
    }

    private hideMessage(message: Message): void {
        const index = this.messages.indexOf(message);
        if (index !== NOT_FOUND_INDEX) {
            this.messages[index].visible = false;
            this.messagesSubject.next([...this.messages]);
        }
    }
}
