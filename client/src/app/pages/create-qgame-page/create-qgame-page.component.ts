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
    questions: Question[] = [];
    modifiedQuestion: boolean = false;
    addQuestionShown: boolean = false;
    gameId: string | null;
    gamesFromDB: Game[] = [];
    gameFromDB: Game;
    gameForm: FormGroup;
    dataReady = false;

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
            visibility: new FormControl(false),
        });
    }
    async ngOnInit(): Promise<void> {
        this.route.paramMap.subscribe((params) => (this.gameId = params.get('id')));
        const id = this.gameId;
        if (id) {
            try {
                const games = await this.gameService.getGames();
                this.gamesFromDB = games;
                this.getGame(id);
                this.gameForm.patchValue({
                    name: this.gameFromDB.title,
                    description: this.gameFromDB.description,
                    time: this.gameFromDB.duration,
                    visibility: this.gameFromDB.isVisible,
                });
                this.dataReady = true;
            } catch (error) {
                // console.error('Error fetching games:', error);
            }
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

    async onSubmit(questionList: Question[], gameForm: FormGroup) {
        const newGame: Game = {
            id: generateNewId(),
            title: gameForm.get('name')?.value || '',
            description: gameForm.get('description')?.value || '',
            isVisible: gameForm.get('visibility')?.value,
            duration: gameForm.get('time')?.value || '',
            lastModification: new Date(),
            questions: questionList,
        };

        if (this.gameId) {
            this.gameService.patchGame(this.gameFromDB);
        } else if (await isValidGame(newGame, this.gameService)) {
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

    addQuestionFromBank() {
        // meme vue que maxime mais on doit ajouter des boutons pour sélectionner et ajouter une bouton de confirmation
    }
}
