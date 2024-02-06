import { Component, Input } from '@angular/core';
// import { FormGroup } from '@angular/forms';
import { Choice, Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.scss'],
})
export class NewQuestionComponent {
    @Input() fromBank: boolean;
    addFromQuestionBank: boolean = false;
    createQuestionShown: boolean = false;
    question: Question = { type: 'QCM', text: '', points: 10, id: '12312312', lastModification: new Date() };
    addBankQuestion: boolean = false;
    constructor(private questionService: QuestionService) {}

    addQuestion(event: Choice[], onlyAddQuestionBank: boolean): void {
        const newQuestion = this.createNewQuestion(event);
        if (this.validateQuestion(newQuestion)) {
            // this.registerQuestion.emit(newQuestion);
            if (!onlyAddQuestionBank) {
                if (this.addBankQuestion) {
                    this.questionService.addQuestionBank(newQuestion);
                    // devrait faire la meme méthode que maxime appel en haut lorsqu'il crée une nouvelle fonction
                    // il faut vérifier que la question n'est pas déjà crée quand on l'ajoute
                }
                this.questionService.addQuestion(newQuestion);

                this.resetComponent();
            } else if (onlyAddQuestionBank) {
                this.questionService.addQuestionBank(newQuestion);
            }
        }
    }
    addQuestionFromBank(event: Question[]): void {
        event.forEach((element) => this.questionService.addQuestion(element));
        this.addFromQuestionBank = false;
    }

    resetComponent() {
        this.question.text = '';
        this.question.points = 10;
        this.question.choices = [];
        // form.reset();
        this.addBankQuestion = false;
    }
    createNewQuestion(choices: Choice[]) {
        return {
            type: this.question.type,
            text: this.question.text,
            points: this.question.points,
            id: generateNewId(),
            choices: choices.map((item: Choice) => ({ ...item })),
            lastModification: new Date(),
        };
    }
    validateQuestion(newQuestion: Question) {
        if (newQuestion.text !== '' && newQuestion.points !== 0 && newQuestion.text.trim().length !== 0) {
            return true;
        }
        return false;
    }
}
