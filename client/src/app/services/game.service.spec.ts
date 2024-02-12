import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from './game.service';

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
            providers: [GameService],
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
});
