import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

const DISAPPEAR_DELAY = 10000;
const MESSAGE_NOT_FOUND = -1;

interface Message {
    text: string;
    sender: string;
    timestamp?: string;
    visible?: boolean;
}

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
export class GamePageLivechatComponent implements OnInit, OnDestroy {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    @Input() isHost: boolean;
    @Input() roomId: string;
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
        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
        }
    }

    listenForMessages(): void {
        this.chatSubscription = this.socket.onChatMessage().subscribe({
            next: (message) => {
                this.messages.push({ text: message.text, sender: message.sender, timestamp: message.timestamp, visible: true });
                // You might want to scroll to the latest message or perform other UI updates here
            },
            error: (error) => console.error(error),
        });
    }

    onChatClick(): void {
        this.textbox.nativeElement.focus();
    }

    onChatEnterPressed(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    sendMessage(): void {
        this.text = this.text.trim();
        if (this.text) {
            this.addMessageToData();
            this.socket.sendMessageToServer(this.text, this.isHost ? 'Organisateur' : this.playerName, this.roomId);
        }
        this.text = '';
    }

    hideMessage(message: { text: string; sender: string; visible: boolean }): void {
        message.visible = false;
        const index = this.messages.indexOf(message);
        if (index !== MESSAGE_NOT_FOUND) {
            this.messages.splice(index, 1);
        }
    }

    private addMessageToData(): void {
        const playerName = this.isHost ? 'Organisateur' : this.playerName;
        const message = { text: this.text, sender: playerName, visible: true };
        if (message.sender === undefined) {
            this.snackbar.openSnackBar('Vous devez être connecté pour envoyer un message', 'Fermer');
            return;
        }
        console.log('message', message);
        this.messages.push(message);
        setTimeout(() => this.hideMessage(message), DISAPPEAR_DELAY);
    }
}
