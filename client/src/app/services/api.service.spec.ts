import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/services/api.service';
import { environment } from 'src/environments/environment';

import type { Game } from '@app/interfaces/game';

const gameMock = {
    id: '1a2b3c',
    title: 'Questionnaire sur le JS',
    description: 'Questions de pratique sur le langage JavaScript',
    duration: 60,
    isVisible: true,
    lastModification: new Date('2018-11-13T20:20:39+00:00'),
    questions: [
        {
            id: '1a2b3l',
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                    isCorrect: false,
                },
            ],
        },
        {
            id: '1a9b3c',
            type: 'QCM',
            text: 'Parmi les villes suivantes, laquelle est la capitale des États-Unis?',
            points: 40,
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            choices: [
                {
                    text: 'New York',
                    isCorrect: false,
                },
                {
                    text: 'Washington',
                    isCorrect: true,
                },
                {
                    text: 'San Francisco',
                    isCorrect: false,
                },
                {
                    text: 'Dallas',
                    isCorrect: false,
                },
            ],
        },
        {
            id: '1V2b3c',
            type: 'QCM',
            text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
            points: 20,
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
                },
            ],
        },
    ],
};

describe('ApiService', () => {
    let httpMock: HttpTestingController;
    let service: ApiService;
    let apiUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService],
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
        apiUrl = environment.serverUrl;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should authenticate and return expected result', () => {
        const password = 'testPassword';
        const expectedResult = true;

        service.authenticate(password).subscribe((result) => {
            expect(result).toEqual(expectedResult);
        });

        const req = httpMock.expectOne(`${apiUrl}/authenticate`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedResult);
    });

    it('should fetch a game and return expected game data', () => {
        const testGameId = '123';
        const expectedGameData: Game = gameMock;

        service.getGame(testGameId).subscribe((gameData) => {
            expect(gameData).toEqual(expectedGameData);
        });

        const req = httpMock.expectOne(`${apiUrl}/game/${testGameId}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameData);
    });

    // Example for testing a method with error handling
    it('should return default empty array for getGames when an error occurs', () => {
        service.getGames().subscribe({
            next: (games: Game[]) => {
                expect(games).toEqual([]);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${apiUrl}/games`);
        req.flush('error', { status: 500, statusText: 'Server Error' });
    });

    it('should create a game and return the created game data', () => {
        const gameData: Game = gameMock;

        service.createGame(gameData).subscribe((result) => {
            expect(result).toEqual(gameData);
        });

        const req = httpMock.expectOne(`${apiUrl}/game`);
        expect(req.request.method).toBe('POST');
        req.flush(gameData);
    });

    it('should update a game and return the updated game data', () => {
        const testGameId = '123';

        service.updateGame(testGameId, gameMock).subscribe((result) => {
            expect(result).toEqual(gameMock);
        });

        const req = httpMock.expectOne(`${apiUrl}/game/${testGameId}`);

        expect(req.request.method).toBe('PATCH');

        req.flush(gameMock);
    });

    it('should delete a game and return the deleted game data', () => {
        const testGameId = '123';

        service.deleteGame(testGameId).subscribe((result) => {
            expect(result).toEqual(gameMock);
        });

        const req = httpMock.expectOne(`${apiUrl}/game/${testGameId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(gameMock);
    });
});
