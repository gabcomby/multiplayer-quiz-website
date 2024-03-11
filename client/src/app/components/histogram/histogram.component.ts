import { Component, Input, OnInit } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';

const SIZE1 = 400;
const SIZE2 = 400;
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
    histogramsData: { question: string; data: { name: string; value: number }[] }[] = [];
    currentIndex: number = 0;

    view: [number, number] = [SIZE2, SIZE1];
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = false;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    yAxisLabel: string = 'Nombre de votes';
    showYAxisLabel: boolean = true;
    xAxisLabel: string = 'Choix de réponses';

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };

    ngOnInit(): void {
        this.constructHistogramsData();
    }

    navigate(offset: number): void {
        const newIndex = this.currentIndex + offset;
        if (newIndex >= 0 && newIndex < this.histogramsData.length) {
            this.currentIndex = newIndex;
        }
    }

    private constructHistogramsData(): void {
        this.questionsGame.forEach((question) => {
            const answerCountsMap = this.calculateAnswerCounts(question);
            const histogramData = this.mapToHistogramData(answerCountsMap);
            this.histogramsData.push({ question: question.text, data: histogramData });
        });
    }

    private calculateAnswerCounts(question: Question): Map<Choice, number> {
        const answerCountsMap: Map<Choice, number> = new Map();
        question.choices.forEach((choice) => answerCountsMap.set(choice, 0));

        this.answersPlayer.forEach(([questionText, choices]) => {
            if (questionText === question.text) {
                choices.forEach((choiceIndex) => {
                    const choice = question.choices[choiceIndex];
                    if (choice) {
                        const count = answerCountsMap.get(choice);
                        if (count !== undefined) {
                            answerCountsMap.set(choice, count + 1);
                        }
                    }
                });
            }
        });

        return answerCountsMap;
    }

    private mapToHistogramData(answerCountsMap: Map<Choice, number>): { name: string; value: number }[] {
        return Array.from(answerCountsMap.entries()).map(([choice, count]) => ({
            name: choice.text,
            value: count,
        }));
    }
}
