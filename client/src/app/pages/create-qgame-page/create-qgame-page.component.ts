import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';

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
    // eslint-disable-next-line max-params
    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
        private snackbarService: SnackbarService,
        public dialog: MatDialog,
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
                this.handleServerError();
                throw new Error(`Game with id ${this.gameId} not found`);
            }
        }
    }

    getGame(gameId: string): void {
        const findGame = this.gamesFromDB.find((gameSelected) => gameSelected.id === gameId);
        if (findGame) {
            this.gameFromDB = findGame;
        } else {
            throw new Error(`Game with id ${gameId} not found`);
        }
    }

    async onSubmit() {
        const newGame: Game = this.createNewGame(true);

        if (this.gameId) {
            await this.gameValidationWhenModified();
        } else if (await isValidGame(newGame, this.snackbarService, this.gameService)) {
            try {
                await this.gameService.createGame(newGame).catch(() => {
                    this.handleServerError();
                });
            } catch (error) {
                this.handleServerError();
            }
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

    async gameValidationWhenModified() {
        const modifiedGame = this.createNewGame(false);
        if (await isValidGame(modifiedGame, this.snackbarService, this.gameService)) {
            try {
                if (await this.gameService.validateDeletedGame(modifiedGame)) {
                    await this.gameService.patchGame(modifiedGame);

                    this.router.navigate(['/home']);
                } else {
                    await this.gameService.createGame(modifiedGame);
                    this.router.navigate(['/home']);
                }
            } catch (error) {
                this.handleServerError();
            }
        }
    }

    createNewGame(isNewGame: boolean) {
        return {
            id: isNewGame ? generateNewId() : this.gameFromDB.id,
            title: this.gameForm.get('name')?.value,
            description: this.gameForm.get('description')?.value,
            isVisible: isNewGame ? false : this.gameFromDB.isVisible,
            duration: this.gameForm.get('time')?.value,
            lastModification: new Date(),
            questions: isNewGame ? this.questionService.getQuestion() : this.gameFromDB.questions,
        };
    }

    private handleServerError = () => {
        this.dialog.open(ServerErrorDialogComponent, {
            data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
        });
    };
}
