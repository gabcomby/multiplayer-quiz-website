import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { FormGroup } from '@angular/forms';
import { API_BASE_URL } from '@app/app.module';
import type { Game } from '@app/interfaces/game';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private questionService: QuestionService,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/api/games`;
    }

    getGame(gameId: string): Observable<Game> {
        return this.http.get<Game>(`${this.apiUrl}/${gameId}`);
    }

    async getGames(): Promise<Game[]> {
        const games$ = this.http.get<Game[]>(this.apiUrl);
        const games = await firstValueFrom(games$);
        return games;
    }

    async createGame(game: Game): Promise<Game> {
        const game$ = this.http.post<Game>(this.apiUrl, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }

    async deleteGame(gameId: string): Promise<void> {
        const game$ = this.http.delete(`${this.apiUrl}/${gameId}`);
        await firstValueFrom(game$);
    }

    async patchGame(game: Game): Promise<Game> {
        const game$ = this.http.patch<Game>(`${this.apiUrl}/${game.id}`, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }
    async validateDuplicationGame(game: Game, error: string[]) {
        const gameList = await this.getGames();
        const titleExisting = gameList.find((element) => element.title.trim() === game.title.trim() && element.id !== game.id);
        const descriptionExisting = gameList.find((element) => element.description.trim() === game.description.trim() && element.id !== game.id);
        if (titleExisting) {
            error.push('Il y a déjà un jeu avec ce nom');
        }
        if (descriptionExisting) {
            error.push('Il y a déjà un jeu avec cet description');
        }
    }
    async validateDeletedGame(game: Game) {
        const gameList = await this.getGames();
        const idExisting = gameList.find((element) => element.id === game.id);
        if (idExisting) {
            return true;
        } else {
            return false;
        }
    }
    async gameValidationWhenModified(gameForm: FormGroup, gameModified: Game) {
        const modifiedGame = this.createNewGame(false, gameForm, gameModified);
        try {
            if (await isValidGame(modifiedGame, this.snackbarService, this.gameService)) {
                if (await this.validateDeletedGame(modifiedGame)) {
                    await this.patchGame(modifiedGame);

                    // this.router.navigate(['/admin']);
                } else {
                    await this.createGame(modifiedGame);
                    // this.router.navigate(['/admin']);
                }
            }
        } catch (error) {
            throw new Error('handling error');
            // this.handleServerError();
        }
    }
    createNewGame(isNewGame: boolean, gameForm: FormGroup, gameModified: Game) {
        return {
            id: isNewGame ? generateNewId() : gameModified.id,
            title: gameForm.get('name')?.value,
            description: gameForm.get('description')?.value,
            isVisible: isNewGame ? false : gameModified.isVisible,
            duration: gameForm.get('time')?.value,
            lastModification: new Date(),
            questions: isNewGame ? this.questionService.getQuestion() : gameModified.questions,
        };
    }
}
