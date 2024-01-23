import { Component } from '@angular/core';

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
})
export class GamePageLivechatComponent {
    messages: string[] = [];
    newMessage: string = '';

    sendMessage(): void {
        if (this.newMessage.trim() !== '') {
            this.messages.push(this.newMessage);
            alert(`Message sent: ${this.newMessage}`);
            this.newMessage = '';
        } else {
            this.newMessage = '';
        }
    }
}
