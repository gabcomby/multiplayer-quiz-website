import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import type { Message } from '@app/interfaces/message';
import { ChatService } from '@app/services/chat.service';
import { Subscription } from 'rxjs';

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
    @ViewChild('messagesContainer') private messagesContainer: ElementRef;

    messages: Message[] = [];
    text: string = '';
    private messagesSubscription: Subscription;

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.listenForMessages();
        this.messagesSubscription = this.chatService.messages$.subscribe((messages) => {
            this.messages = messages;
            this.scrollToBottom();
        });
    }

    ngOnDestroy() {
        this.messagesSubscription.unsubscribe();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    onChatInput(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    private sendMessage(): void {
        this.chatService.sendMessage(this.text, this.playerName, this.roomId, this.isHost);
        this.text = '';
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}
