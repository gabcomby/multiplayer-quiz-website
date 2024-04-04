import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Player } from '@app/interfaces/match';
import { SnackbarService } from '@app/services/snackbar.service';

@Component({
    selector: 'app-game-qrl-answer',
    templateUrl: './game-qrl-answer.component.html',
    styleUrls: ['./game-qrl-answer.component.scss'],
})
export class GameQrlAnswerComponent implements OnChanges {
    @Input() timerStopped: boolean;
    @Output() selectedValuesEmitter = new EventEmitter<[Player, number][]>();
    @Output() isNotedEmitter = new EventEmitter<boolean>();
    answersQRLSorted: [Player, string][] = [];
    answersQRLInput: [Player, string][] = [];
    selectedValues: [Player, number][] = [];
    isNoted: boolean = false;

    constructor(private snackbarService: SnackbarService) {}
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
        if (this.selectedValues.length !== this.answersQRLInput.length) {
            this.snackbarService.openSnackBar('Veuillez noter tous les joueurs', 'Fermer');
            return;
        }
        this.isNoted = true;
        this.isNotedEmitter.emit(this.isNoted);
        this.selectedValuesEmitter.emit(this.selectedValues);
        this.reset();
    }

    reset() {
        this.selectedValues = [];
        this.answersQRLInput = [];
    }
}
