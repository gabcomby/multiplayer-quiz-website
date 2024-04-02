import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Player } from '@app/interfaces/match';
// import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-qrl-answer',
    templateUrl: './game-qrl-answer.component.html',
    styleUrls: ['./game-qrl-answer.component.scss'],
})
export class GameQrlAnswerComponent implements OnChanges {
    @Output() selectedValuesEmitter = new EventEmitter<[Player, number][]>();
    @Output() isNotedEmitter = new EventEmitter<boolean>();
    answersQRLSorted: [Player, string][] = [];
    answersQRLInput: [Player, string][] = [];
    selectedValues: [Player, number][] = [];
    isNoted: boolean = false;
    // constructor(private gameService: GameService) {}

    @Input()
    set answersQRL(value: [Player, string][]) {
        this.answersQRLInput = value;

        this.filterAnswers();
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.answersQRL) {
            this.filterAnswers();
            this.isNoted = false;
        }
    }

    filterAnswers() {
        this.answersQRLInput.sort((a, b) => a[0].name.localeCompare(b[0].name));
    }

    onSubmit() {
        this.isNoted = true;
        this.isNotedEmitter.emit(this.isNoted);
        this.selectedValuesEmitter.emit(this.selectedValues);
    }
}
