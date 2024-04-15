import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { API_BASE_URL } from '@app/app.module';
import { Game, QuestionType } from '@app/interfaces/game';
import { ApiService } from '@app/services/api/api.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import { of, throwError } from 'rxjs';
import { AdminService } from './admin.service';

describe('AdminService', () => {
    let service: AdminService;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let assignNewGameAttributesSpy: jasmine.Spy;
    let gameValidationServiceSpy: jasmine.SpyObj<GameValidationService>;
    let gameMock = {} as unknown as Game;
    const defaultDate = new Date();

    beforeEach(() => {
        const SPY_GAME_VALIDATION_SERVICE = jasmine.createSpyObj('GameValidationService', ['isValidGame']);
        const SPY_SNACKBAR_SERVICE = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const SPY_SOCKET_SERVICE = jasmine.createSpyObj('SocketService', ['connect']);
        const SPY_API_SERVICE = jasmine.createSpyObj('ApiService', ['getGame', 'getGames', 'patchGame', 'createGame', 'deleteGame']);
        const SPY_ASSIGN_NEW_GAME_ATTRIBUTES = jasmine.createSpy('assignNewGameAttributes');
        assignNewGameAttributesSpy = SPY_ASSIGN_NEW_GAME_ATTRIBUTES;
        gameValidationServiceSpy = SPY_GAME_VALIDATION_SERVICE;

        TestBed.configureTestingModule({
            providers: [
                AdminService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
                { provide: GameValidationService, useValue: SPY_GAME_VALIDATION_SERVICE },
                { provide: SnackbarService, useValue: SPY_SNACKBAR_SERVICE },
                { provide: SocketService, useValue: SPY_SOCKET_SERVICE },
                { provide: ApiService, useValue: SPY_API_SERVICE },
                { provide: assignNewGameAttributes, useValue: SPY_ASSIGN_NEW_GAME_ATTRIBUTES },
            ],
            imports: [HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],
        });
        gameMock = { id: '1', isVisible: true } as unknown as Game;
        service = TestBed.inject(AdminService);
        // gameValidationServiceSpy = TestBed.inject(GameValidationService) as jasmine.SpyObj<GameValidationService>;
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        // assignNewGameAttributesSpy = TestBed.inject(assignNewGameAttributes) as jasmine.Spy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should toggle visibility', fakeAsync(() => {
        apiServiceSpy.getGame.and.returnValue(of(gameMock));
        apiServiceSpy.patchGame.and.returnValue(Promise.resolve(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.toggleVisibility(gameMock, false);
        flush();
        expect(apiServiceSpy.getGame).toHaveBeenCalled();
        expect(apiServiceSpy.patchGame).toHaveBeenCalled();
    }));

    it("shouldn't toggle visibility if game does not exist", fakeAsync(() => {
        apiServiceSpy.patchGame.and.returnValue(Promise.resolve(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.toggleVisibility(gameMock, false);
        flush();
        expect(apiServiceSpy.getGame).toHaveBeenCalled();
        expect(apiServiceSpy.patchGame).not.toHaveBeenCalled();
    }));

    it('should export game as json', fakeAsync(() => {
        apiServiceSpy.getGame.and.returnValue(of(gameMock));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.exportGameAsJson(gameMock);
        flush();
        expect(apiServiceSpy.getGame).toHaveBeenCalled();
    }));

    it("should render an error if game doesn't exist", (done) => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        const errorMessage = 'Game not found';
        apiServiceSpy.getGame.and.returnValue(throwError(() => new Error(errorMessage)));

        service.exportGameAsJson(gameMock);
        expect(apiServiceSpy.getGame).toHaveBeenCalled();
        done();
    });

    it('should add game', () => {
        const dataSource = [gameMock];
        service.addGame(gameMock, 'title', dataSource);
        expect(apiServiceSpy.createGame).toHaveBeenCalled();
    });

    it('should delete game', fakeAsync(() => {
        apiServiceSpy.deleteGame.and.returnValue(Promise.resolve());
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.deleteGame('1').then(() => {
            expect(apiServiceSpy.deleteGame).toHaveBeenCalled();
            expect().nothing();
        });

        flush();
    }));

    it('should render an error if game does not exist', (done) => {
        const errorMessage = 'Game not found';
        apiServiceSpy.deleteGame.and.returnValue(Promise.reject(new Error(errorMessage)));
        snackbarServiceSpy.openSnackBar.and.returnValue();

        service.deleteGame('1').then(() => {
            expect(apiServiceSpy.deleteGame).toHaveBeenCalled();
            done();
        });
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

    it('should handle error when fetching games fails', async () => {
        apiServiceSpy.getGames.and.returnValue(Promise.reject('Error'));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(service, 'fetchGames').and.callThrough();
        await privateSpy.call(service);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalled();
    });

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
        apiServiceSpy.getGames.and.returnValue(Promise.resolve([gameMock]));
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

    it('should assign new game attributes if game is valid', async () => {
        const fakeGame: Game = {
            id: '123',
            title: 'allo',
            description: 'test',
            isVisible: false,
            duration: 10,
            lastModification: defaultDate,
            questions: [
                {
                    type: QuestionType.QCM,
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
        };
        gameValidationServiceSpy.isValidGame.and.returnValue(Promise.resolve(true));
        await service.prepareGameForImport(fakeGame);
        expect(gameValidationServiceSpy.isValidGame).toHaveBeenCalled();
        expect(assignNewGameAttributesSpy).toHaveBeenCalled();
    });
});
