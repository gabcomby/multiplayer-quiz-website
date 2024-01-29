// import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Game, Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';

@Component({
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
})
export class CreateQGamePageComponent {
    // game: Game = {
    //     id: '',
    //     title: '',
    //     description: '',
    //     isVisible: true,
    //     duration: 0,
    //     lastModification: new Date(),
    //     questions: [],
    // };
    questions: Question[] = [];
    isNotVisible: boolean = false;
    modifiedQuestion: boolean = false;
    addQuestionShown: boolean = false;
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl('', Validators.required),
    });

    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
    ) {
        this.questions = this.questionService.getQuestion();
    }

    onSubmit(questionList: Question[], gameForm: FormGroup, isNotVisible: boolean) {
        const newGame: Game = {
            id: generateNewId(),
            title: gameForm.get('name')?.value || '',
            description: gameForm.get('description')?.value || '',
            isVisible: isNotVisible,
            duration: gameForm.get('time')?.value || '',
            lastModification: new Date(),
            questions: questionList,
        };

        if (isValidGame(newGame)) {
            this.gameService.createGame(newGame);
            // console.log(newGame);
            // location.reload();
        } else {
            // console.log(newGame);
        }
    }
    toggleAddQuestion() {
        this.addQuestionShown = !this.addQuestionShown;
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }
}
