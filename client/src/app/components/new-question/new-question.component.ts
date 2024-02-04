import { Component, Input } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Input() fromNewGame: boolean;
    addFromQuestionBank: boolean = false;
    createQuestionShown: boolean = false;
    question: Question = { type: 'QCM', text: '', points: 0, id: '12312312', lastModification: new Date() };
    addBankQuestion: boolean = false;
    constructor(private questionService: QuestionService) {}

    addQuestion(event: Choice[], onlyAddQuestionBank: boolean): void {
        const newQuestion = {
            type: this.question.type,
            text: this.question.text,
            points: this.question.points,
            id: generateNewId(),
            choices: event.map((item) => ({ ...item })),
            lastModification: new Date(),
        };
        if (newQuestion.text !== '' && newQuestion.points !== 0) {
            if (!onlyAddQuestionBank) {
                this.questionService.addQuestion(newQuestion);
            } else {
                // console.log('maxime');
            }
            if (this.addBankQuestion) {
                // devrait faire la meme méthode que maxime appel en haut lorsqu'il crée une nouvelle fonction
                // il faut vérifier que la question n'est pas déjà crée quand on l'ajoute
            }
        }

        this.question.text = '';
        this.question.points = 0;
        this.question.choices = [];
        this.addBankQuestion = false;
    }
    addQuestionFromBank(event: Question[]): void {
        event.forEach((element) => this.questionService.addQuestion(element));
        this.addFromQuestionBank = false;
    }
}
