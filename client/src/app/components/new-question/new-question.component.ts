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

    async addQuestion(event: Choice[], onlyAddQuestionBank: boolean): Promise<void> {
        const newQuestion = this.createNewQuestion(event);
        if (this.validateQuestion(newQuestion)) {
            if (!onlyAddQuestionBank) {
                if (this.addBankQuestion && (await this.validateQuestionExisting(newQuestion))) {
                    this.questionService.addQuestionBank(newQuestion);
                }
                this.questionService.addQuestion(newQuestion);
                this.resetComponent(event);
            } else if (onlyAddQuestionBank && (await this.validateQuestionExisting(newQuestion))) {
                this.questionService.addQuestionBank(newQuestion);
            }
        }
    }
    addQuestionFromBank(event: Question[]): void {
        event.forEach((element) => this.questionService.addQuestion(element));
        this.addFromQuestionBank = false;
    }

    resetComponent(event: Choice[]) {
        this.question.text = '';
        this.question.points = 10;
        this.question.choices = [];
        event.forEach((element) => {
            element.isCorrect = false;
            element.text = '';
        });
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
        alert('needs a question and points and cannot be just whitespace');
        return false;
    }
    async validateQuestionExisting(question: Question): Promise<boolean> {
        const questionInBank = await this.questionService.getQuestions();
        const findQuestion = questionInBank.find((element) => element.text === question.text);
        if (findQuestion) {
            alert('question already exist');
            return false;
        }
        return true;
    }
}
