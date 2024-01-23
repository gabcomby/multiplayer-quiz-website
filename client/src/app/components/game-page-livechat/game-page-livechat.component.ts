import { Component } from '@angular/core';

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
})
export class GamePageLivechatComponent {
    messages: { text: string; visible: boolean }[] = [];
    newMessage: string = '';
    private readonly messageDisappearDelay = 10000;

    sendMessage(): void {
        if (this.newMessage.trim() !== '') {
            const message = { text: this.newMessage, visible: true };
            this.messages.push(message);

            setTimeout(() => {
                this.hideMessage(message);
            }, this.messageDisappearDelay);

            this.newMessage = '';
        } else {
            this.newMessage = '';
        }
    }

    hideMessage(message: { text: string; visible: boolean }): void {
        message.visible = false;
        const index = this.messages.indexOf(message);
        if (index !== -1) {
            this.messages.splice(index, 1);
        }
    }
}
