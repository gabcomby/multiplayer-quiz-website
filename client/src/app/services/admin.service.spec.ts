import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { AdminService } from './admin.service';
import { GameService } from './game.service';
import { SnackbarService } from './snackbar.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Game } from '@app/interfaces/game';
import { of, throwError } from 'rxjs';
import { SocketService } from './socket.service';

describe('AdminService', () => {
    let service: AdminService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameMock = {} as unknown as Game;

    beforeEach(() => {
        const SPY_GAME_SERVICE = jasmine.createSpyObj('GameService', ['getGame', 'getGames', 'patchGame', 'isValidGame', 'createGame', 'deleteGame']);
        const SPY_SNACKBAR_SERVICE = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const SPY_SOCKET_SERVICE = jasmine.createSpyObj('SocketService', ['connect']);
        TestBed.configureTestingModule({
            providers: [
                AdminService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
                { provide: GameService, useValue: SPY_GAME_SERVICE },
                { provide: SnackbarService, useValue: SPY_SNACKBAR_SERVICE },
                { provide: SocketService, useValue: SPY_SOCKET_SERVICE },
            ],
            imports: [HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],
        });
        gameMock = { id: '1', isVisible: true } as unknown as Game;
        service = TestBed.inject(AdminService);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should toggle visibility', fakeAsync(() => {
        gameServiceSpy.getGame.and.returnValue(of(gameMock));
        gameServiceSpy.patchGame.and.returnValue(Promise.resolve(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.toggleVisibility(gameMock, false);
        flush();
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
        expect(gameServiceSpy.patchGame).toHaveBeenCalled();
    }));

    it("shouldn't toggle visibility if game does not exist", fakeAsync(() => {
        gameServiceSpy.patchGame.and.returnValue(Promise.resolve(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.toggleVisibility(gameMock, false);
        flush();
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
        expect(gameServiceSpy.patchGame).not.toHaveBeenCalled();
    }));

    it('should export game as json', fakeAsync(() => {
        gameServiceSpy.getGame.and.returnValue(of(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.exportGameAsJson(gameMock);
        flush();
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
    }));

    it("should render an error if game doesn't exist", (done) => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        const errorMessage = 'Game not found';
        gameServiceSpy.getGame.and.returnValue(throwError(() => new Error(errorMessage)));

        service.exportGameAsJson(gameMock);
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
        done();
    });

    it('should add game', () => {
        const dataSource = [gameMock];
        service.addGame(gameMock, 'title', dataSource);
        expect(gameServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should delete game', fakeAsync(() => {
        gameServiceSpy.deleteGame.and.returnValue(Promise.resolve());
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.deleteGame('1').then(() => {
            expect(gameServiceSpy.deleteGame).toHaveBeenCalled();
            expect().nothing();
        });

        flush();
    }));

    it('should render an error if game does not exist', (done) => {
        const errorMessage = 'Game not found';
        gameServiceSpy.deleteGame.and.returnValue(Promise.reject(new Error(errorMessage)));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.deleteGame('1').then(() => {
            expect(gameServiceSpy.deleteGame).toHaveBeenCalled();
            done();
        });
    });

    it('should prepare game for import and assign a new id', () => {
        const game = {} as Game;
        gameServiceSpy.isValidGame.and.returnValue(Promise.resolve(true));
        service.prepareGameForImport(game);
        expect(game.id).toBeDefined();
    });

    it('should format date last modification date', () => {
        const date = new Date().toISOString();
        const formattedDate = service.formatLastModificationDate(date);
        expect(formattedDate).toBeDefined();
    });

    it('should not read file from input if it is not a json', fakeAsync(() => {
        const file = new File([''], 'filename', { type: 'text/plain' });
        const result = service.readFileFromInput(file);
        expect(result).toBeDefined();

        flush();
    }));

    it('should read file from input', fakeAsync(() => {
        const file = new File([JSON.stringify({ key: 'value' })], 'filename.json', { type: 'application/json' });
        const result = service.readFileFromInput(file);
        expect(result).toBeDefined();

        flush();
    }));

    it('should handle error when fetching games fails', fakeAsync(() => {
        gameServiceSpy.getGames.and.returnValue(Promise.reject(new Error('Error')));
        try {
            service['fetchGames']();
        } catch (error) {
            expect(error).toBeDefined();
        }

        flush();
    }));

    it('should remove unwanted fields from array of objects', () => {
        const inputData = [
            { _id: '123', name: 'Game A', isVisible: true },
            { _id: '456', name: 'Game B', isVisible: false },
        ];

        const expectedOutput = [{ name: 'Game A' }, { name: 'Game B' }];

        const result = service['removeUnwantedFields'](inputData as unknown[]);
        expect(result).toEqual(expectedOutput);
    });

    it("should init admin's page", fakeAsync(() => {
        socketServiceSpy.connect.and.callThrough();
        gameServiceSpy.getGames.and.returnValue(Promise.resolve([gameMock]));
        service.init().then((result) => {
            expect(result).toBeDefined();
        });
        flush();
    }));

    it("should filter if game is unique in admin's page", () => {
        const dataSource = [gameMock];
        const result = service['hasValidInput']('title', 'title', dataSource);
        expect(result).toBeTrue();
    });

    it("should return false if lenght is greater than MAX_GAME_NAME_LENGTH in admin's page", () => {
        const dataSource = [gameMock];
        const result = service['hasValidInput']('maximumlengthoftitleislarglyexceeededbyme', 'title', dataSource);
        expect(result).toBeTrue();
    });

    it("should return false if lenght is 0 in admin's page", () => {
        const dataSource = [gameMock];
        const result = service['hasValidInput']('', 'title', dataSource);
        expect(result).toBeTrue();
    });
});
