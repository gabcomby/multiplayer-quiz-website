import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

const NOT_EXIST = -1;
const DISAPPEAR_DELAY = 10000;

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
export class GamePageLivechatComponent {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    messages: { text: string; sender: string; visible: boolean }[] = [];
    newMessage: string = '';

    onChatClick(): void {
        this.textbox.nativeElement.focus();
    }

    sendMessage(): void {
        if (this.newMessage.trim() !== '') {
            const message = { text: this.newMessage, sender: this.playerName, visible: true };
            this.messages.push(message);

            setTimeout(() => {
                this.hideMessage(message);
            }, DISAPPEAR_DELAY);

            this.newMessage = '';
        } else {
            this.newMessage = '';
        }
    }

    hideMessage(message: { text: string; sender: string; visible: boolean }): void {
        message.visible = false;
        const index = this.messages.indexOf(message);
        if (index !== NOT_EXIST) {
            this.messages.splice(index, 1);
        }
    }
}
