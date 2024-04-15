import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HISTOGRAM_SIZE } from '@app/config/client-config';
import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges {
    @Input() answersPlayer: [string | Player, number[] | string][];
    @Input() questionsGame: Question[];
    @Input() nbModified: number;
    @Input() resultView: boolean;

    answerCounts: Map<string, Map<Choice, number>> = new Map();
    answerCountsArray: { key: string; value: Map<Choice, number> }[] = [];
    histogramData: { name: string; value: number }[] = [];
    histogramsData: { question: string; data: { name: string; value: number }[] }[] = [];
    currentIndex: number = 0;
    dataQrl: { question: string; data: { name: string; value: number }[] }[] = [];

    view: [number, number] = [HISTOGRAM_SIZE, HISTOGRAM_SIZE];
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
    maxYAxis: number = 1;

    colorScheme = {
        domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    };
    constructor(private gameService: GameService) {}

    get currentQuestionValue(): Question | null {
        return this.gameService.currentQuestionValue;
    }
    get playerListValue(): Player[] {
        return this.gameService.playerListValue;
    }
    get timerStoppedValue(): boolean {
        return this.gameService.timerStoppedValue;
    }

    ngOnInit(): void {
        this.constructHistogramsData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.answersPlayer && this.currentQuestionValue?.type === QuestionType.QCM) {
            this.constructLiveHistogramData();
        } else if (changes.nbModified && this.currentQuestionValue?.type === QuestionType.QRL) {
            this.constructLiveHistogramQrl();
        }
    }

    navigate(offset: number): void {
        const newIndex = this.currentIndex + offset;
        if (newIndex >= 0 && newIndex < this.histogramsData.length) {
            this.currentIndex = newIndex;
        }
    }

    private constructLiveHistogramQrl(): void {
        if (!this.questionsGame[0]) {
            return;
        }
        this.maxYAxis = this.playerListValue.length;
        const nbNotModified = this.playerListValue.length - this.nbModified;
        const data = [
            { name: 'modified', value: this.nbModified },
            { name: 'not modified', value: nbNotModified },
        ];

        this.dataQrl = [{ question: this.questionsGame[0].text, data: Array.from(data) }];
    }

    private constructLiveHistogramData(): void {
        if (!this.questionsGame[0]) {
            return;
        }
        const questionChoices = this.countQuestionChoices(this.questionsGame[0]);
        this.formatData(this.questionsGame[0], questionChoices);
    }

    private countQuestionChoices(question: Question): number[] {
        if (question.choices) {
            const questionChoices = new Array(question.choices.length).fill(0);
            // eslint-disable-next-line -- Disabled since it's unused here but used in another function under this one
            this.answersPlayer.forEach(([playerId, answerIdx]) => {
                if (typeof answerIdx !== 'string') {
                    answerIdx.forEach((idx) => {
                        questionChoices[idx]++;
                    });
                }
            });
            return questionChoices;
        }
        return [];
    }
    private formatData(question: Question, questionChoices: number[]) {
        if (question.choices) {
            const histogramData: { name: string; value: number }[] = [];
            for (let i = 0; i < question.choices.length; i++) {
                const choiceText = question.choices[i].isCorrect ? `${question.choices[i].text} (correct)` : question.choices[i].text;
                histogramData.push({ name: choiceText, value: questionChoices[i] });
            }

            this.histogramsData = [{ question: question.text, data: histogramData }];
        }
    }

    private constructHistogramsData(): void {
        this.histogramsData = [];
        this.questionsGame.forEach((question) => {
            if (question.type === 'QRL') {
                const answerCountsMap = this.calculateAnswerCountsQRL(question);
                const histogramData = this.mapToHistogramDataQrl(answerCountsMap);
                this.histogramsData.push({ question: question.text, data: histogramData });
            } else {
                const answerCountsMap = this.calculateAnswerCounts(question);
                const histogramData = this.mapToHistogramData(answerCountsMap);
                this.histogramsData.push({ question: question.text, data: histogramData });
            }
        });
    }

    private calculateAnswerCounts(question: Question): Map<Choice, number> {
        const answerCountsMap: Map<Choice, number> = new Map();

        if (!question.choices) return answerCountsMap;
        const choicesQuestion = question.choices;
        question.choices.forEach((choice) => answerCountsMap.set(choice, 0));
        this.answersPlayer.forEach(([questionText, choices]) => {
            if (questionText !== question.text || typeof choices === 'string') return;
            choices.forEach((choiceIndex) => {
                const choice = choicesQuestion[choiceIndex];
                if (!choice) return;
                const count = answerCountsMap.get(choice);
                if (count !== undefined) {
                    answerCountsMap.set(choice, count + 1);
                }
            });
        });
        return answerCountsMap;
    }

    private calculateAnswerCountsQRL(question: Question): Map<string, number> {
        const answerCountsMap: Map<string, number> = new Map();
        this.answersPlayer.forEach(([questionText, answer]) => {
            if (questionText === question.text) {
                if (typeof answer[0] === 'number' && typeof answer[1] === 'number' && typeof answer[2] === 'number') {
                    answerCountsMap.set('0', answer[0]);
                    answerCountsMap.set('0.5', answer[1]);
                    answerCountsMap.set('1', answer[2]);
                }
            }
        });
        return answerCountsMap;
    }
    private mapToHistogramData(answerCountsMap: Map<Choice, number>): { name: string; value: number }[] {
        return Array.from(answerCountsMap.entries()).map(([choice, count]) => ({
            name: choice.isCorrect ? `${choice.text} (correct)` : choice.text,
            value: count,
        }));
    }

    private mapToHistogramDataQrl(answerCountsMap: Map<string, number>): { name: string; value: number }[] {
        return Array.from(answerCountsMap.entries()).map(([point, count]) => ({
            name: point,
            value: count,
        }));
    }
}
