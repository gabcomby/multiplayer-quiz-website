import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Player } from '@app/interfaces/match';

@Component({
    selector: 'app-game-qrl-answer',
    templateUrl: './game-qrl-answer.component.html',
    styleUrls: ['./game-qrl-answer.component.scss'],
})
export class GameQrlAnswerComponent implements OnChanges {
    @Input() timerStopped: boolean;
    @Output() selectedValuesEmitter = new EventEmitter<[Player, number][]>();
    answersQRLSorted: [Player, string][] = [];
    answersQRLInput: [Player, string][] = [];
    selectedValues: [Player, number][] = [];

    @Input()
    set answersQRL(value: [Player, string][]) {
        this.answersQRLInput = value;
        this.filterAnswers();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.answersQRL) {
            this.filterAnswers();
        }
    }

    filterAnswers() {
        this.answersQRLInput.sort((a, b) => a[0].name.localeCompare(b[0].name));
    }

    setSelectedValues(value: [Player, number], index: number) {
        this.selectedValues[index] = value;
        this.selectedValuesEmitter.emit(this.selectedValues);
    }
}
