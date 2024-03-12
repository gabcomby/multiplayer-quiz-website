import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket.service';

@Injectable({
    providedIn: 'root',
})
export class HistogramService {
    constructor(private socketService: SocketService) {}

    setupWebsocketEvents(): void {
        this.socketService.onLivePlayerAnswers((data) => {
            this.addAnswersClicked(data);
        });
    }

    addAnswersClicked(answersClicked: [string, number[]][]): void {
        console.log('Answers clicked', answersClicked);
    }
}
