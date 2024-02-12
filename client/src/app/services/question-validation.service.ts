import { Injectable } from '@angular/core';
import { Choice, Question } from '@app/interfaces/game';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionValidationService {
    constructor(private snackbarService: SnackbarService) {}

    answerValid(answer: Choice[]) {
        let valid = true;
        answer.forEach((elem) => {
            if (elem.text === '') {
                valid = false;
                this.snackbarService.openSnackBar('tous les champs des choix de réponses doivent être remplis');
            }
        });
        return valid;
    }
    verifyOneGoodAndBadAnswer(choices: Choice[]): boolean {
        let goodAnswer = 0;
        for (const choice of choices) {
            if (choice.isCorrect) {
                goodAnswer++;
            }
        }

        if (goodAnswer < 1 || goodAnswer === choices.length) {
            this.snackbarService.openSnackBar('Au moins une bonne réponse et une mauvaise réponse');
            return false;
        }
        return true;
    }
    verifyOneGoodAndBadAnswer2(index: number, questionList: Question[]): boolean {
        const question = questionList[index];

        let goodAnswerCount = 0;
        if (question.choices) {
            for (const choice of question.choices) {
                if (choice.isCorrect) {
                    goodAnswerCount++;
                }
            }

            if (goodAnswerCount < 1 || goodAnswerCount === question.choices.length) {
                this.snackbarService.openSnackBar('Il doit y avoir au moins une bonne et mauvaise réponse');

                return false;
            }
        }

        return true;
    }
    // validateQuestion(newQuestion: Question) {
    //     if (newQuestion.text !== '' && newQuestion.points !== 0 && newQuestion.text.trim().length !== 0) {
    //         if (newQuestion.choices) {
    //             if (this.answerValid(newQuestion.choices)) return true;
    //         }
    //     } else this.snackbarService.openSnackBar('La question a besoin d une question, de point et pas juste des espaces');
    //     return false;
    // }

    validatePoints(newQuestion: Question) {
        const MAX_POINTS = 100;
        const MIN_POINTS = 10;
        const points = newQuestion.points;
        return points % MIN_POINTS === 0 && points >= MIN_POINTS && points <= MAX_POINTS;
    }
    validateQuestion(newQuestion: Question) {
        if (newQuestion.text !== '' && this.validatePoints(newQuestion) && newQuestion.text.trim().length !== 0) {
            if (newQuestion.choices) {
                if (this.answerValid(newQuestion.choices)) return true;
            }
        }
        this.snackbarService.openSnackBar('la question a un besoin d un nom, de point (multiple de 10 entre 10 et 100) et pas juste des espaces');
        return false;
    }
}
