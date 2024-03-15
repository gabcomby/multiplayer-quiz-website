import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    @Input() playerLeftList: Player[];
}
