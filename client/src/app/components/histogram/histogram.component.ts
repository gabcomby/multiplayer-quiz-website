import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/game';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
    @Input() questionData: Question;
}
