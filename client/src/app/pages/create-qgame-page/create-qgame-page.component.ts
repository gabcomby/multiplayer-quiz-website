import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { Game } from '@app/interfaces/game';
import { ApiService } from '@app/services/api/api.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { QuestionService } from '@app/services/question/question.service';

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
    games: Game[] = [];
    gameModified: Game = {
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

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private questionService: QuestionService,
        private gameValidationService: GameValidationService,
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
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
                this.games = await this.apiService.getGames();
                this.getGame(this.gameId);
                this.insertIfExist();
                this.dataReady = true;
            } catch (error) {
                this.handleServerError();
            }
        }
    }
    async onSubmit() {
        const newGame: Game = this.gameValidationService.createNewGame(true, this.gameForm, this.gameModified);
        try {
            if (this.gameId) {
                if (await this.gameValidationService.gameValidationWhenModified(this.gameForm, this.gameModified)) {
                    this.router.navigate(['/admin']);
                }
            } else if (await this.gameValidationService.isValidGame(newGame)) {
                await this.apiService.createGame(newGame);
                this.router.navigate(['/admin']);
            }
        } catch (error) {
            this.handleServerError();
        }
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }
    private getGame(gameId: string): void {
        const findGame = this.games.find((gameSelected) => gameSelected.id === gameId);
        if (findGame) {
            this.gameModified = findGame;
        } else {
            throw new Error(`Game with id ${gameId} not found`);
        }
    }

    private insertIfExist() {
        this.gameForm.patchValue({
            name: this.gameModified.title,
            description: this.gameModified.description,
            time: this.gameModified.duration,
            visibility: this.gameModified.isVisible,
        });
    }

    private handleServerError = () => {
        this.dialog.open(ServerErrorDialogComponent, {
            data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
        });
    };
}
