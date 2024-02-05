import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { isValidGame, validateDeletedGame } from '@app/utils/is-valid-game';

@Component({
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
})
export class CreateQGamePageComponent implements OnInit {
    @Input() game: Game;
    fromBank: boolean = false;
    // questions: Question[] = [];
    modifiedQuestion: boolean = false;
    addQuestionShown: boolean = true;
    gameId: string | null;
    gamesFromDB: Game[] = [];
    gameFromDB: Game;
    gameForm: FormGroup;
    dataReady: boolean = false;

    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
        private route: ActivatedRoute, // private router: Router,
    ) {
        this.questionService.resetQuestions();
        // this.questions = this.questionService.getQuestion();
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

    async onSubmit(gameForm: FormGroup) {
        const newGame: Game = {
            id: generateNewId(),
            title: gameForm.get('name')?.value || '',
            description: gameForm.get('description')?.value || '',
            isVisible: gameForm.get('visibility')?.value,
            duration: gameForm.get('time')?.value || '',
            lastModification: new Date(),
            questions: this.questionService.getQuestion(),
        };

        if (this.gameId) {
            if (await isValidGame(this.gameFromDB, this.gameService, false)) {
                if (await validateDeletedGame(this.gameFromDB, this.gameService)) {
                    // console.log(this.gameFromDB);
                    this.gameService.patchGame(this.gameFromDB);
                } else {
                    this.gameService.createGame(this.gameFromDB);
                }
            }
        } else if (await isValidGame(newGame, this.gameService, true)) {
            this.gameService.createGame(newGame);
            // this.router.navigate(['/home']);
            // location.reload();
        }
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }
}
