import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-modify-q-game-page',
    templateUrl: './modify-q-game-page.component.html',
    styleUrls: ['./modify-q-game-page.component.scss'],
})
export class ModifyQGamePageComponent {
    @Input() game: Game;
}
