import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

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
export class GamePageLivechatComponent implements OnInit {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    @Input() isHost: boolean = false;
    @Input() roomId: string;
    messages: { text: string; sender: string; visible: boolean; timestamp: string }[] = [];
    newMessage: string = '';

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        this.chatService.getMessages().subscribe((messages) => {
            this.messages = messages;
        });
    }

    onChatClick(): void {
        this.textbox.nativeElement.focus();
    }

    onEnterKeyPressed(event: Event): void {
        event.preventDefault();
        this.chatService.sendMessage(this.newMessage, this.playerName, this.isHost);
        this.newMessage = '';
    }

    onButtonClicked(): void {
        this.chatService.sendMessage(this.newMessage, this.playerName, this.isHost);
        this.newMessage = '';
    }
}
