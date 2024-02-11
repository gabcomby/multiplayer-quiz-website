import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { isValidGame, validationDuplication } from '@app/utils/is-valid-game';

@Component({
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
})
export class CreateQGamePageComponent implements OnInit {
    @Input() game: Game;
    fromBank: boolean = false;
    modifiedQuestion: boolean = false;
    gameId: string | null;
    gamesFromDB: Game[] = [];
    gameFromDB: Game = {
        id: '',
        title: '',
        description: '',
        isVisible: false,
        duration: 10,
        lastModification: new Date(),
        questions: [],
    };
    gameForm: FormGroup;
    dataReady: boolean = false;

    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
        private snackbarService: SnackbarService,
    ) {
        this.questionService.resetQuestions();
        this.gameForm = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            time: new FormControl('', Validators.required),
        });
    }
    async ngOnInit(): Promise<void> {
        this.route.paramMap.subscribe((params) => (this.gameId = params.get('id')));
        if (this.gameId) {
            try {
                this.gamesFromDB = await this.gameService.getGames();
                this.getGame(this.gameId);
                this.insertIfExist();
                this.dataReady = true;
            } catch (error) {
                throw new Error(`Game with id ${this.gameId} not found`);
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

    async onSubmit() {
        const newGame: Game = this.createNewGame(true);

        if (this.gameId) {
            await this.gameValidationWhenModified();
        } else if (await this.newGameValidation(newGame)) {
            this.gameService.createGame(newGame);
            // je veux retourner a admin
            this.router.navigate(['/home']);
        }
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }

    insertIfExist() {
        this.gameForm.patchValue({
            name: this.gameFromDB.title,
            description: this.gameFromDB.description,
            time: this.gameFromDB.duration,
            visibility: this.gameFromDB.isVisible,
        });
    }
    async newGameValidation(newGame: Game) {
        if (!isValidGame(newGame, this.snackbarService)) {
            return false;
        }
        if (!(await validationDuplication(this.gameService, newGame, this.snackbarService))) {
            return false;
        } else {
            return true;
        }
    }

    async gameValidationWhenModified() {
        if (isValidGame(this.gameFromDB, this.snackbarService)) {
            if (await this.gameService.validateDeletedGame(this.gameFromDB)) {
                this.gameService.patchGame(this.createNewGame(false));
                this.router.navigate(['/home']);
            } else {
                this.gameService.createGame(this.gameFromDB);
                this.router.navigate(['/home']);
            }
        }
    }

    createNewGame(isNewGame: boolean) {
        return {
            id: isNewGame ? generateNewId() : this.gameFromDB.id,
            title: this.gameForm.get('name')?.value,
            description: this.gameForm.get('description')?.value,
            isVisible: isNewGame ? false : this.gameForm.get('visibility')?.value,
            duration: this.gameForm.get('time')?.value,
            lastModification: new Date(),
            questions: isNewGame ? this.questionService.getQuestion() : this.gameFromDB.questions,
        };
    }
}
