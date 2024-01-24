import { Component, OnInit } from '@angular/core';
import { games, Game } from '@app/pages/game';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games = [...games];
    gameSelected: { [key: string]: boolean } = {};
    constructor(private router: Router) {}
    ngOnInit() {
        for (const item of this.games) {
            this.gameSelected[item.id] = false;
        }
    }
    getInformations(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
        if (this.gameSelected[game.id] === true) {
            const gameClicked = document.getElementById(game.id);
            const p = document.createElement('p');
            p.textContent = 'Description: ' + game.description + ' Temps alloué par questions: ' + game.timePerQuestions;
            p.id = 'informations';
            gameClicked?.appendChild(p);

            const buttonTest = document.createElement('button');
            buttonTest.id = 'testerLeJeu';
            buttonTest.textContent = 'tester le jeu';
            buttonTest.addEventListener('click', () => {
                this.router.navigate(['/testGame', game.id]);
            });
            gameClicked?.appendChild(buttonTest);

            const buttonWait = document.createElement('button');
            buttonWait.id = 'creationGame';
            buttonWait.textContent = 'Creer la parte';
            buttonWait.addEventListener('click', () => {
                this.router.navigate(['/gameWait', game.id]);
            });
            gameClicked?.appendChild(buttonWait);
        } else {
            const elementToDelete = document.getElementById('informations');
            elementToDelete?.remove();
            const element = document.getElementById('testerLeJeu');
            element?.remove();
            const waitButton = document.getElementById('creationGame');
            waitButton?.remove();
        }
    }
}
