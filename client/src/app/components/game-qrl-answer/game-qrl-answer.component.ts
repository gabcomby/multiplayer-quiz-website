import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '@app/interfaces/match';

@Component({
    selector: 'app-game-qrl-answer',
    templateUrl: './game-qrl-answer.component.html',
    styleUrls: ['./game-qrl-answer.component.scss'],
})
export class GameQrlAnswerComponent {
    @Output() selectedValuesEmitter = new EventEmitter<[Player, number][]>();
    answersQRLSorted: [Player, string][] = [];
    answersQRLInput: [Player, string][] = [];
    selectedValues: [Player, number][] = [];
    isNoted: boolean = false;

    @Input()
    set answersQRL(value: [Player, string][]) {
        this.answersQRLInput = value;
        this.filterAnswers();
    }

    filterAnswers() {
        this.answersQRLInput.sort((a, b) => a[0].name.localeCompare(b[0].name));
    }

    onSubmit() {
        this.isNoted = true;
        this.selectedValuesEmitter.emit(this.selectedValues);
    }
}
