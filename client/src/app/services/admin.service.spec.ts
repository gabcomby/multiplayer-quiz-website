import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { AdminService } from './admin.service';
import { GameService } from './game.service';
import { SnackbarService } from './snackbar.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Game } from '@app/interfaces/game';
import { of } from 'rxjs';

describe('AdminService', () => {
    let service: AdminService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let gameMock = {} as unknown as Game;

    beforeEach(() => {
        const SpyGameService = jasmine.createSpyObj('GameService', ['getGame', 'patchGame']);
        const SnackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);

        TestBed.configureTestingModule({
            providers: [
                AdminService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
                { provide: GameService, useValue: SpyGameService },
                { provide: SnackbarService, useValue: SnackbarService },
            ],
            imports: [HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],
        });
        gameMock = { id: '1', isVisible: true } as unknown as Game;
        service = TestBed.inject(AdminService);
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
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

    it("shouldn't toggle visibility", fakeAsync(() => {
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
});
