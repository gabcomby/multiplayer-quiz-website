import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { GamePlayed } from '@app/interfaces/game';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { GamePlayedService } from './game-played.service';

describe('GamePlayedService', () => {
    let service: GamePlayedService;
    let httpTestingController: HttpTestingController;
    const snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);

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
            providers: [
                GamePlayedService,
                { provide: API_BASE_URL, useValue: mockApiBaseUrl },
                { provide: SnackbarService, useValue: snackbarServiceMock },
            ],
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
        service.deleteGamesPlayed().then(() => {
            return;
        });

        const req = httpTestingController.expectOne(`${mockApiBaseUrl}/games-played/deleteAllGamesPlayed`);
        expect(req.request.method).toEqual('DELETE');
        req.flush({});
    });

    it('should format date last modification date', () => {
        const date = new Date().toISOString();
        const formattedDate = service.formatDate(date);
        expect(formattedDate).toBeDefined();
    });
});
