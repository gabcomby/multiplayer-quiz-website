import { Component, OnInit } from '@angular/core';
import { Player } from '@app/interfaces/match';

@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent implements OnInit {
    dataSource: Player[] = [];

    async ngOnInit() {
        this.dataSource = [
            { id: 'player1', name: 'Alice', score: 10, isLocked: false },
            { id: 'player2', name: 'Bob', score: 15, isLocked: true },
            { id: 'player3', name: 'Charlie', score: 20, isLocked: false },
            { id: 'player4', name: 'David', score: 15, isLocked: true },
        ];
        this.dataSource.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }

    // const fakeLobby: Lobby = {
    //     id: '1234',
    //     playerList: [
    //         { id: 'player1', name: 'Alice', score: 10, isLocked: false },
    //         { id: 'player2', name: 'Bob', score: 20, isLocked: true },
    //     ],
    //     gameId: 'game123',
    //     bannedNames: ['BadPlayer1', 'BadPlayer2'],
    //     lobbyCode: 'ABCD',
    //     isLocked: false,
    //     hostId: 'player1',
    // };

    // const fakeGame: Game = {
    //     id: 'game1',
    //     title: 'Jeu de quiz',
    //     description: 'Un jeu de quiz passionnant avec une variété de questions.',
    //     isVisible: true,
    //     duration: 30,
    //     lastModification: new Date(),
    //     questions: [
    //         {
    //             type: 'QCM',
    //             text: 'Quelle est la capitale de la France ?',
    //             points: 10,
    //             choices: [
    //                 { text: 'Paris', isCorrect: true },
    //                 { text: 'Lyon', isCorrect: false },
    //                 { text: 'Marseille', isCorrect: false },
    //                 { text: 'Toulouse', isCorrect: false },
    //             ],
    //             lastModification: new Date(),
    //             id: 'question1',
    //         },
    //         {
    //             type: 'QCM',
    //             text: 'Je suis cool ?',
    //             points: 10,
    //             choices: [
    //                 { text: 'Oui', isCorrect: true },
    //                 { text: 'Non', isCorrect: false },
    //             ],
    //             lastModification: new Date(),
    //             id: 'question1',
    //         },
    //     ],
    // };
}
