import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';

const SIZE1 = 400;
const SIZE2 = 400;
@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges {
    @Input() answersPlayer: [string | Player, number[] | string][];
    @Input() questionsGame: Question[];
    @Input() nbModified: number;
    @Input() nbNotModified: number;

    answerCounts: Map<string, Map<Choice, number>> = new Map();
    answerCountsArray: { key: string; value: Map<Choice, number> }[] = [];
    histogramData: { name: string; value: number }[] = [];
    histogramsData: { question: string; data: { name: string; value: number }[] }[] = [];
    currentIndex: number = 0;
    dataQrl: { question: string; data: { modified: string; value: number }[] }[] = [];

    view: [number, number] = [SIZE2, SIZE1];
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Nombre de votes';
    yAxisLabelQrl: string = 'Nombre de modification';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Choix de réponses';
    xAxisLabelQrl: string = 'Modification';

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };

    ngOnInit(): void {
        if (this.answersPlayer) {
            this.constructHistogramsData();
        } else {
            // this.constructLiveHistogramQrl();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.answersPlayer) {
            this.constructLiveHistogramData();
        }
        if (changes.nbModified) {
            // console.log('modifier' + this.nbModified);
            // this.constructLiveHistogramQrl();
        }
    }

    navigate(offset: number): void {
        const newIndex = this.currentIndex + offset;
        if (newIndex >= 0 && newIndex < this.histogramsData.length) {
            this.currentIndex = newIndex;
        }
    }
    // private constructLiveHistogramQrl(): void {
    //     const data = [
    //         { modified: 'modified', value: this.nbModified },
    //         { modified: 'not modified', value: 0 },
    //     ];
    //     this.dataQrl.push({ question: 'hein', data: Array.from(data) });
    // }

    private constructLiveHistogramData(): void {
        if (!this.questionsGame[0]) {
            return;
        }
        if (this.questionsGame[0].choices) {
            const array = new Array(this.questionsGame[0].choices.length).fill(0);
            // eslint-disable-next-line -- Disabled since it's unused here but used in another function under this one
            this.answersPlayer.forEach(([playerId, answerIdx]) => {
                if (typeof answerIdx !== 'string') {
                    answerIdx.forEach((idx) => {
                        array[idx]++;
                    });
                }
            });
            const histogramData: { name: string; value: number }[] = [];
            for (let i = 0; i < this.questionsGame[0].choices.length; i++) {
                const choiceText = this.questionsGame[0].choices[i].isCorrect
                    ? `${this.questionsGame[0].choices[i].text} (correct)`
                    : this.questionsGame[0].choices[i].text;
                histogramData.push({ name: choiceText, value: array[i] });
            }

            this.histogramsData = [{ question: this.questionsGame[0].text, data: histogramData }];
        }
    }

    private constructHistogramsData(): void {
        this.histogramsData = [];
        this.questionsGame.forEach((question) => {
            const answerCountsMap = this.calculateAnswerCounts(question);
            const histogramData = this.mapToHistogramData(answerCountsMap);
            this.histogramsData.push({ question: question.text, data: histogramData });
        });
    }

    private calculateAnswerCounts(question: Question): Map<Choice, number> {
        const answerCountsMap: Map<Choice, number> = new Map();
        // if(typeof this.answersPlayer === 'string'){
        //     return answerCountsMap
        // }
        if (question.choices) {
            question.choices.forEach((choice) => answerCountsMap.set(choice, 0));
            this.answersPlayer.forEach(([questionText, choices]) => {
                if (questionText === question.text) {
                    if (typeof choices !== 'string') {
                        choices.forEach((choiceIndex) => {
                            // Add a check here to ensure question.choices is defined
                            if (question.choices) {
                                const choice = question.choices[choiceIndex];
                                if (choice) {
                                    const count = answerCountsMap.get(choice);
                                    if (count !== undefined) {
                                        answerCountsMap.set(choice, count + 1);
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }

        return answerCountsMap;
    }

    private mapToHistogramData(answerCountsMap: Map<Choice, number>): { name: string; value: number }[] {
        return Array.from(answerCountsMap.entries()).map(([choice, count]) => ({
            name: choice.isCorrect ? `${choice.text} (correct)` : choice.text,
            value: count,
        }));
    }
}
