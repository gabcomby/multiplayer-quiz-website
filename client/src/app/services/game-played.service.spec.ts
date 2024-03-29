import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { GamePlayed } from '@app/interfaces/game';
import { GamePlayedService } from './game-played.service';

describe('GamePlayedService', () => {
    let service: GamePlayedService;
    let httpTestingController: HttpTestingController;

    const mockApiBaseUrl = 'http://localhost:3000';
    const mockGamesPlayed: GamePlayed[] = [
        {
            id: 'abc123',
            title: 'game1',
            numberPlayers: 2,
            bestScore: 100,
            creationDate: new Date(),
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GamePlayedService, { provide: API_BASE_URL, useValue: mockApiBaseUrl }],
        });
        service = TestBed.inject(GamePlayedService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getGamesPlayed() should retrieve games played', async () => {
        service.getGamesPlayed().then((data) => {
            expect(data).toEqual(mockGamesPlayed);
        });

        const req = httpTestingController.expectOne(`${mockApiBaseUrl}/games-played`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockGamesPlayed);
    });

    it('deleteGamesPlayed() should delete all games played', async () => {
        service.deleteGamesPLayed().then(() => {
            return;
        });

        const req = httpTestingController.expectOne(`${mockApiBaseUrl}/games-played/deleteAllGamesPlayed`);
        expect(req.request.method).toEqual('DELETE');
        req.flush({});
    });

    it('formatDate() should format date string correctly', () => {
        const testDateString = '2023-04-01T12:30:45Z';
        const expectedFormattedDate = '2023-04-01 08:30:45';

        const formattedDate = service.formatDate(testDateString);
        expect(formattedDate).toEqual(expectedFormattedDate);
    });
});
