import { Component, Input, OnInit } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';

const SIZE1 = 400;
const SIZE2 = 700;
@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit {
    @Input() answersPlayer: [string, number[]][];
    @Input() questionsGame: Question[];

    answerCounts: Map<string, Map<Choice, number>> = new Map();
    answerCountsArray: { key: string; value: Map<Choice, number> }[] = [];
    histogramData: { name: string; value: number }[];

    view: [number, number] = [SIZE2, SIZE1];
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Nombre de votes';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Choix de réponses';
    ngOnInit(): void {
        this.constructAnswerCounts();
        this.answerCounts.forEach((value, key) => {
            this.answerCountsArray.push({ key, value });
        });
        this.dataHistogram();
    }

    private constructAnswerCounts(): void {
        this.questionsGame.forEach((question) => {
            const answerCountMap: Map<Choice, number> = new Map();
            question.choices.forEach((choice) => answerCountMap.set(choice, 0));
            this.answerCounts.set(question.text, answerCountMap);
        });

        this.answersPlayer.forEach(([questionText, choices]) => {
            const answerCountMap = this.answerCounts.get(questionText);
            if (answerCountMap) {
                choices.forEach((choiceIndex) => {
                    const choice = this.questionsGame.find((question) => question.text === questionText)?.choices[choiceIndex];
                    if (choice) {
                        const count = answerCountMap.get(choice);
                        if (count !== undefined) {
                            answerCountMap.set(choice, count + 1);
                        }
                    }
                });
            }
        });
    }

    private dataHistogram(): void {
        this.histogramData = this.answerCountsArray
            .map((answer) => {
                const data: { name: string; value: number }[] = [];
                answer.value.forEach((count, choice) => {
                    data.push({ name: choice.text, value: count });
                });
                return data;
            })
            .reduce((acc, curr) => acc.concat(curr), []);
    }
}
