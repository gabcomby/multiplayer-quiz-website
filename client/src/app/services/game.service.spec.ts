import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { API_BASE_URL, GameService } from './game.service';

describe('GamesService', () => {
    let service: GameService;
    let httpController: HttpTestingController;
    const defaultDate = new Date();

    const gamesMock: Game[] = [
        {
            id: '123',
            title: 'allo',
            description: 'test',
            isVisible: false,
            duration: 10,
            lastModification: defaultDate,
            questions: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: defaultDate,
                },
            ],
        },
        {
            id: '124',
            title: 'bonjour',
            description: 'test2',
            isVisible: false,
            duration: 20,
            lastModification: defaultDate,
            questions: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: defaultDate,
                },
            ],
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameService, { provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all games', () => {
        service.getGames().then((games) => {
            expect(games).toEqual(gamesMock);
        });

        const req = httpController.expectOne('http://localhost:3000/api/games');
        expect(req.request.method).toBe('GET');
        req.flush(gamesMock);
    });

    it('should get a game', () => {
        service.getGame('123').subscribe((game) => {
            expect(game).toEqual(gamesMock[0]);
        });

        const req = httpController.expectOne('http://localhost:3000/api/games/123');
        expect(req.request.method).toBe('GET');
        req.flush(gamesMock[0]);
    });

    it('should create a game', () => {
        service.createGame(gamesMock[0]).then((game) => {
            expect(game).toEqual(gamesMock[0]);
        });

        const req = httpController.expectOne('http://localhost:3000/api/games');
        expect(req.request.method).toBe('POST');
        req.flush(gamesMock[0]);
    });

    it('should call delete with the correct URL', async () => {
        const gameId = '123';

        service.deleteGame(gameId).then(() => {
            expect().nothing();
        });

        const req = httpController.expectOne(`${service['apiUrl']}/${gameId}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush({});
    });

    it('should call update with the correct URL', async () => {
        const game = gamesMock[0];

        service.patchGame(game).then(() => {
            expect().nothing();
        });

        const req = httpController.expectOne(`${service['apiUrl']}/${game.id}`);
        expect(req.request.method).toEqual('PATCH');
        req.flush(game);
    });

    it('should add an error if a game with the same title exists', async () => {
        const mockGames = [
            { id: '1', title: 'Existing Game', description: 'Some description' },
            { id: '2', title: 'Another Game', description: 'Another description' },
        ];
        spyOn(service, 'getGames').and.returnValue(Promise.resolve(mockGames as Game[]));
        service.getGames = jasmine.createSpy().and.returnValue(Promise.resolve(mockGames as Game[]));

        const errors: string[] = [];
        const newGame = { id: '3', title: 'Existing Game', description: 'New description' };

        await service.validateDuplicationGame(newGame as Game, errors);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe('Il y a déjà un jeu avec ce nom');
    });

    it('should add an error if a game with the same description exists', async () => {
        const mockGames = [
            { id: '1', title: 'Game One', description: 'Duplicate description' },
            { id: '2', title: 'Game Two', description: 'Unique description' },
        ];
        spyOn(service, 'getGames').and.returnValue(Promise.resolve(mockGames as Game[]));
        service.getGames = jasmine.createSpy().and.returnValue(Promise.resolve(mockGames as Game[]));
        const errors: string[] = [];
        const newGame = { id: '3', title: 'New Title', description: 'Duplicate description' };

        await service.validateDuplicationGame(newGame as Game, errors);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe('Il y a déjà un jeu avec cet description');
    });

    it('should not add an error if no duplicates are found', async () => {
        const mockGames = [
            { id: '1', title: 'Game One', description: 'Some description' },
            { id: '2', title: 'Game Two', description: 'Another description' },
        ];
        spyOn(service, 'getGames').and.returnValue(Promise.resolve(mockGames as Game[]));
        service.getGames = jasmine.createSpy().and.returnValue(Promise.resolve(mockGames as Game[]));
        const errors: string[] = [];
        const newGame = { id: '3', title: 'New Game', description: 'New description' };

        await service.validateDuplicationGame(newGame as Game, errors);

        expect(errors.length).toBe(0);
    });

    it('should return true if the game is deleted', async () => {
        const mockGames = [
            { id: '1', title: 'Game One', description: 'Some description' },
            { id: '2', title: 'Game Two', description: 'Another description' },
        ];
        spyOn(service, 'getGames').and.returnValue(Promise.resolve(mockGames as Game[]));
        service.getGames = jasmine.createSpy().and.returnValue(Promise.resolve(mockGames as Game[]));

        const game = { id: '1', title: 'Game One', description: 'Some description' };

        const result = await service.validateDeletedGame(game as Game);

        expect(result).toBe(true);
    });

    it('should return false if the game is not deleted', async () => {
        const mockGames = [
            { id: '1', title: 'Game One', description: 'Some description' },
            { id: '2', title: 'Game Two', description: 'Another description' },
        ];
        spyOn(service, 'getGames').and.returnValue(Promise.resolve(mockGames as Game[]));

        service.getGames = jasmine.createSpy().and.returnValue(Promise.resolve(mockGames as Game[]));

        const game = { id: '3', title: 'Game Three', description: 'Some description' };

        const result = await service.validateDeletedGame(game as Game);

        expect(result).toBe(false);
    });
});
