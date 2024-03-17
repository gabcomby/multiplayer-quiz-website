import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { Game } from '@app/interfaces/game';
import { ApiService } from './api.service';

describe('ApiService', () => {
    let service: ApiService;
    let httpTestingController: HttpTestingController;
    const defaultDate = new Date();

    const fakeGames: Game[] = [
        { id: '1', title: 'Game 1', description: 'Description 1', isVisible: true, duration: 60, lastModification: defaultDate, questions: [] },
        { id: '2', title: 'Game 2', description: 'Description 2', isVisible: false, duration: 45, lastModification: defaultDate, questions: [] },
    ];

    const fakeGame: Game = {
        id: '3',
        title: 'Game 3',
        description: 'Description 3',
        isVisible: true,
        duration: 60,
        lastModification: defaultDate,
        questions: [],
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService, { provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
        });
        service = TestBed.inject(ApiService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve game by ID from API', () => {
        service.getGame('1').subscribe((game) => {
            expect(game).toEqual(fakeGames[0]);
        });

        const req = httpTestingController.expectOne('http://localhost:3000/games/1');
        expect(req.request.method).toBe('GET');
        req.flush(fakeGames[0]);
    });

    it('should retrieve games from API', () => {
        service.getGames().then((games: Game[]) => {
            expect(games).toEqual(fakeGames);
        });

        const req = httpTestingController.expectOne('http://localhost:3000/games');
        expect(req.request.method).toBe('GET');
        req.flush(fakeGames);
    });

    it('should create game', () => {
        service.createGame(fakeGame).then((game) => {
            expect(game).toEqual(fakeGame);
        });

        const req = httpTestingController.expectOne('http://localhost:3000/games');
        expect(req.request.method).toBe('POST');
        req.flush(fakeGame);
    });

    it('should delete game', () => {
        const gameId = '2';
        service.deleteGame(gameId);

        const req = httpTestingController.expectOne('http://localhost:3000/games/2');
        expect(req.request.method).toBe('DELETE');
        req.flush(fakeGames[1]);
    });

    it('should patch game', () => {
        const patchGame: Game = {
            id: '2',
            title: 'Game 2',
            description: 'Description 2 patch',
            isVisible: true,
            duration: 60,
            lastModification: defaultDate,
            questions: [],
        };
        service.patchGame(patchGame);

        const req = httpTestingController.expectOne('http://localhost:3000/games/2');
        expect(req.request.method).toBe('PATCH');
        req.flush(fakeGames[1]);
    });
});
