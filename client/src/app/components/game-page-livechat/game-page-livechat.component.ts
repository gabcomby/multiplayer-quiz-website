import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import type { Message } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

const DISAPPEAR_DELAY = 8000;

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
    animations: [
        trigger('fade', [
            transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class GamePageLivechatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() playerName: string;
    @Input() isHost: boolean;
    @Input() roomId: string;
    @ViewChild('textbox') textbox: ElementRef;
    @ViewChild('messagesContainer') private messagesContainer: ElementRef;

    messages: Message[] = [];
    text: string = '';

    private chatSubscription: Subscription;

    constructor(
        private snackbar: SnackbarService,
        private socket: SocketService,
    ) {}

    ngOnInit(): void {
        this.listenForMessages();
    }

    ngOnDestroy() {
        this.chatSubscription?.unsubscribe();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    listenForMessages(): void {
        this.chatSubscription = this.socket.onChatMessage().subscribe({
            next: (message) => this.handleNewMessage(message),
            error: () => this.snackbar.openSnackBar('Pas de salle, vos messages ne seront pas envoyés'),
        });
    }

    onChatInput(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    sendMessage(): void {
        const trimmedText = this.text.trim();
        if (!this.isHost && !this.playerName) {
            this.snackbar.openSnackBar('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
            return;
        }

        if (trimmedText) {
            this.handleNewMessage({ text: trimmedText, sender: this.isHost ? 'Organisateur' : this.playerName, timestamp: new Date() });
            this.socket.sendMessageToServer(trimmedText, this.isHost ? 'Organisateur' : this.playerName, this.roomId);
        }
        this.text = '';
    }

    handleNewMessage(message: Message): void {
        const newMessage = { ...message, timestamp: message.timestamp ? new Date(message.timestamp) : new Date(), visible: true };
        this.messages.push(newMessage);
        setTimeout(() => this.hideMessage(newMessage), DISAPPEAR_DELAY);
    }

    hideMessage(message: Message): void {
        const index = this.messages.indexOf(message);
        // eslint-disable-next-line -- Used to hide message
        if (index !== -1) {
            this.messages[index].visible = false;
            this.messages = [...this.messages];
        }
    }

    scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}
