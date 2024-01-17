import { Component } from '@angular/core';
import { games } from '../game';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent {
    games = [...games];
}
