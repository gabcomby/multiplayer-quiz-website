import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
export class CreateQGamePageComponent implements OnInit {
    @Input() game: Game;
    // game: Game = {
    //     id: '',
    //     title: '',
    //     description: '',
    //     isVisible: true,
    //     duration: 0,
    //     lastModification: new Date(),
    //     questions: [],
    // };
    // wtf: Question[] = [
    //     {
    //         type: 'QCM',
    //         text: 'fuck',
    //         points: 2,
    //         lastModification: new Date(),
    //         id: '10391048',
    //     },
    // ];
    questions: Question[] = [];
    isNotVisible: boolean = false;
    modifiedQuestion: boolean = false;
    addQuestionShown: boolean = false;
    gameId: string | null;
    gamesFromDB: Game[] = [];
    gameFromDB: Game;
    questionsFromDB: Question[];
    gameForm: FormGroup;
    // gameForm = new FormGroup({
    //     name: new FormControl('', Validators.required),
    //     description: new FormControl('', Validators.required),
    //     time: new FormControl('', Validators.required),
    // });
    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
        private route: ActivatedRoute,
    ) {
        this.questionService.resetQuestions();
        this.questions = this.questionService.getQuestion();
        this.gameForm = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            time: new FormControl('', Validators.required),
        });
    }
    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => (this.gameId = params.get('id')));
        const id = this.gameId;
        if (id) {
            this.gameService.getGames().then((games) => {
                this.gamesFromDB = games;
                this.getGame(id);
                this.gameForm.patchValue({ name: this.gameFromDB.title, description: this.gameFromDB.description, time: this.gameFromDB.duration });
                this.questionsFromDB = this.gameFromDB.questions;
                console.log(this.questionsFromDB);
                // Pas besoin de vérification de non-null ici
            });
        }
    }

    getGame(gameId: string): void {
        const findGame = this.gamesFromDB.find((gameSelected) => gameSelected.id === gameId);
        if (findGame) {
            this.gameFromDB = findGame;
        }
        if (!this.gameFromDB) {
            throw new Error(`Game with id ${gameId} not found`);
        }
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
