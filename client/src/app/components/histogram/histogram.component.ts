import { Component, Input, OnInit } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';

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

    ngOnInit(): void {
        this.constructAnswerCounts();
        this.answerCounts.forEach((value, key) => {
            this.answerCountsArray.push({ key, value });
        });
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
}
