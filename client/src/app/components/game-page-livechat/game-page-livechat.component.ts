import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import type { Message } from '@app/interfaces/message';
import { ChatService } from '@app/services/chat/chat.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
})
export class GamePageLivechatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() playerName: string;
    @Input() isHost: boolean;
    @Input() roomId: string;
    @ViewChild('messagesContainer') private messagesContainer: ElementRef;

    onDestroy$: Subject<boolean> = new Subject();
    messages: Message[] = [];
    text: string = '';

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.listenForMessages();
        this.chatService.listenForSystemMessages();
        this.chatService.messages$.pipe(takeUntil(this.onDestroy$)).subscribe((messages: Message[]) => {
            this.messages = messages;
            this.scrollToBottom();
        });
    }

    ngOnDestroy() {
        this.chatService.stopListeningForMessages();
        this.chatService.stopListeningForSystemMessages();
        this.onDestroy$.next(true);
        this.onDestroy$.unsubscribe();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    onChatInput(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    private sendMessage(): void {
        this.chatService.sendMessage({
            text: this.text,
            playerName: this.playerName,
            roomId: this.roomId,
            isHost: this.isHost,
        });
        this.text = '';
    }

    private scrollToBottom(): void {
        if (this.messagesContainer && this.messagesContainer.nativeElement) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
    }
}
