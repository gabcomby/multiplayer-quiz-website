import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

const DISAPPEAR_DELAY = 10000;
const MESSAGE_NOT_FOUND = -1;

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
})
export class GamePageLivechatComponent implements OnInit {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    @Input() isHost: boolean = false;
    messages: { text: string; sender: string; visible: boolean }[] = [];
    newMessage: string = '';

    constructor(private socketService: SocketService) {}

    ngOnInit(): void {
        this.setupWebSocketEvents();
    }

    onChatClick(): void {
        this.textbox.nativeElement.focus();
    }

    onChatEnterPressed(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    sendMessage(): void {
        this.newMessage = this.newMessage.trim();
        if (this.newMessage) {
            const formattedMessage = this.isHost ? 'Organisateur' : `${this.playerName}`;
            this.broadcastMessage(this.newMessage, formattedMessage);
            this.socketService.sendMessages(this.newMessage, this.playerName, this.isHost);
            this.newMessage = '';
        }
    }

    hideMessage(message: { text: string; sender: string; visible: boolean }): void {
        const index = this.messages.indexOf(message);
        if (index !== MESSAGE_NOT_FOUND) {
            this.messages.splice(index, 1);
        }
    }

    private broadcastMessage(message: string, sender: string): void {
        this.messages.push({ text: message, sender, visible: true });
        setTimeout(() => this.hideMessage(this.messages[this.messages.length - 1]), DISAPPEAR_DELAY);
    }

    private setupWebSocketEvents(): void {
        this.socketService.onChatMessage().subscribe(({ text, sender }) => {
            this.broadcastMessage(text, sender);
        });
    }
}
