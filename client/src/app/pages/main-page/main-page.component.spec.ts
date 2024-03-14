/* eslint-disable-next-line max-classes-per-file -- Those are  mock class */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthService } from '@app/services/auth.service';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of, throwError } from 'rxjs';

class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({ userName: 'hello', lobbyCode: '123' }),
        };
    }
}

class AuthServiceMock {
    authenticate(password: string) {
        return of(password === 'validPassword');
    }
}

class SnackbarServiceMock {
    openSnackBar(message: string) {
        return message;
    }
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let router: Router;
    let fixture: ComponentFixture<MainPageComponent>;
    let authService: AuthService;
    let snackbarService: SnackbarService;
    let dialog: MatDialog;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let matchLobbyServiceSpy: jasmine.SpyObj<MatchLobbyService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['verifyRoomLock', 'onRoomLockStatus', 'connect', 'joinRoom']);
        matchLobbyServiceSpy = jasmine.createSpyObj('MatchLobbyService', [
            'authentificateNameOfUser',
            'getLobbyByCode',
            'addPlayer',
            'authenticateUser',
        ]);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['initializeLobbyAndGame']);

        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([{ path: 'admin', component: DummyAdminComponent }]),
                HttpClientTestingModule,
                MatDialogModule,
                MatCheckboxModule,
                MatIconModule,
            ],
            declarations: [MainPageComponent, DummyAdminComponent],
            providers: [
                { provide: AuthService, useClass: AuthServiceMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: SnackbarService, useClass: SnackbarServiceMock },
                { provide: HttpClient, useValue: {} },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MatchLobbyService, useValue: matchLobbyServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();

        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthService);
        snackbarService = TestBed.inject(SnackbarService);
        dialog = TestBed.inject(MatDialog);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });

    it('should open admin dialog', () => {
        spyOn(dialog, 'open').and.callThrough();
        component.openAdminDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should authenticate user with valid password', async () => {
        spyOn(authService, 'authenticate').and.returnValue(of(true));
        const navigateSpy = spyOn(router, 'navigate');
        // @ts-expect-error -- handleDialogClose is private
        await component.handleDialogClose('validPassword');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle authentication error', () => {
        const errorResponse = new HttpErrorResponse({
            error: { body: 'Invalid password' },
            status: 401,
        });
        spyOn(authService, 'authenticate').and.returnValue(throwError(() => errorResponse));
        spyOn(snackbarService, 'openSnackBar');
        // @ts-expect-error -- handleDialogClose is private
        component.handleDialogClose('invalidPassword');
        expect(snackbarService.openSnackBar).toHaveBeenCalledWith('Mot de passe invalide');
        // Add checks for ServerErrorDialogComponent as needed
    });

    it('should open ServerErrorDialogComponent for non-password related errors', () => {
        const errorResponse = new HttpErrorResponse({
            error: { body: 'Unexpected error' },
            status: 500,
        });
        spyOn(authService, 'authenticate').and.returnValue(throwError(() => errorResponse));
        const dialogSpy = spyOn(dialog, 'open').and.callThrough();

        // @ts-expect-error -- Accessing private method for testing
        component.handleDialogClose('anyPassword');

        fixture.detectChanges();
        fixture.whenStable();

        expect(dialogSpy).toHaveBeenCalledWith(ServerErrorDialogComponent, {
            data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
        });
    });
    it("should return true if locked'", async () => {
        const lobbyCode = 'testCode';
        socketServiceSpy.onRoomLockStatus.and.callFake((callback) => {
            callback(true);
        });
        const result = await component.fetchLobbyLockStatus(lobbyCode);
        expect(result).toBe(true);
    });
    it("should return false if not locked'", async () => {
        const lobbyCode = 'testCode';
        socketServiceSpy.onRoomLockStatus.and.callFake((callback) => {
            callback(false);
        });
        const result = await component.fetchLobbyLockStatus(lobbyCode);
        expect(result).toBe(false);
    });
    it("should return false if userName or lobby code are not empty'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'isEmptyDialog').and.callThrough();
        const resultDialog = privateSpy.call(component, result);
        expect(resultDialog).toBeFalse();
    });
    it("should return true if userName or lobby code are empty'", async () => {
        const result = { userName: ' ', lobbyCode: ' ' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'isEmptyDialog').and.callThrough();
        const resultDialog = privateSpy.call(component, result);
        expect(resultDialog).toBeTrue();
    });
    it("should add player to lobby when handleGameJoin'", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isEmptyDialog');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleDialogCloseBanned');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'authenticateUserIfBanned');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'addPlayer');

        matchLobbyServiceSpy.authentificateNameOfUser.and.returnValue(of(true));
        spyOn(dialog, 'open').and.callThrough();
        await component.handleGameJoin();
        expect(socketServiceSpy.connect).toHaveBeenCalled();
        expect(dialog.open).toHaveBeenCalled();
    });
    it("should handle connection to lobby when handleGameJoin'", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isEmptyDialog').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'handleDialogCloseBanned');

        spyOn(snackbarService, 'openSnackBar');

        spyOn(dialog, 'open').and.callThrough();
        await component.handleGameJoin();
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should add player to lobby when addplayer called'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const lobby = { id: '11', playerList: [], gameId: '22', bannedNames: [], lobbyCode: '333', isLocked: false, hostId: '444' };
        matchLobbyServiceSpy.getLobbyByCode.and.returnValue(of(lobby));
        matchLobbyServiceSpy.addPlayer.and.returnValue(
            of({ ...lobby, playerList: [...lobby.playerList, { id: 'idPlayer', name: 'allo', score: 1, bonus: 2 }] }),
        );
        spyOn(router, 'navigate');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'addPlayer').and.callThrough();
        privateSpy.call(component, result, true, true);
        expect(router.navigate).toHaveBeenCalled();
        expect(socketServiceSpy.joinRoom).toHaveBeenCalled();
        expect(gameServiceSpy.initializeLobbyAndGame).toHaveBeenCalled();
    });
    it("should have error when error thrown'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        matchLobbyServiceSpy.getLobbyByCode.and.returnValue(throwError(() => new Error('error')));
        //
        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'addPlayer').and.callThrough();
        privateSpy.call(component, result, true, true);
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should have error when error thrown'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const lobby = { id: '11', playerList: [], gameId: '22', bannedNames: [], lobbyCode: '333', isLocked: false, hostId: '444' };
        matchLobbyServiceSpy.getLobbyByCode.and.returnValue(of(lobby));
        matchLobbyServiceSpy.addPlayer.and.returnValue(throwError(() => new Error('error')));
        //
        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'addPlayer').and.callThrough();
        privateSpy.call(component, result, true, true);
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should have error when error thrown'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const lobby = { id: '11', playerList: [], gameId: '22', bannedNames: [], lobbyCode: '333', isLocked: false, hostId: '444' };
        matchLobbyServiceSpy.getLobbyByCode.and.returnValue(of(lobby));

        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'addPlayer').and.callThrough();
        privateSpy.call(component, result, false, false);
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should call authenticateUserifBanned'", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'authenticateUserIfBanned');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'handleDialogCloseBanned').and.callThrough();
        privateSpy.call(component, 'result', '123');
    });
    it("should fetchlobbyLockStatus when authenticateUserIfBanned is called'", async () => {
        matchLobbyServiceSpy.authenticateUser.and.returnValue(of(false));
        // eslint-disable-next-line no-unused-vars
        spyOn(component, 'fetchLobbyLockStatus').and.callFake(async (lobbyCode: string) => {
            return Promise.resolve(true);
        });

        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'authenticateUserIfBanned').and.callThrough();
        const result = await privateSpy.call(component, '123', '22');
        expect(result).toBe(false);
    });
    it("should return true when result is false and lobby locked'", async () => {
        matchLobbyServiceSpy.authenticateUser.and.returnValue(of(false));
        // eslint-disable-next-line no-unused-vars
        spyOn(component, 'fetchLobbyLockStatus').and.callFake(async (lobbyCode: string) => {
            return Promise.resolve(false);
        });

        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'authenticateUserIfBanned').and.callThrough();
        const result = await privateSpy.call(component, '123', '22');
        expect(result).toBe(true);
    });
    it("should return true when result is false and lobby locked'", async () => {
        matchLobbyServiceSpy.authenticateUser.and.returnValue(of(true));
        // eslint-disable-next-line no-unused-vars
        spyOn(component, 'fetchLobbyLockStatus').and.callFake(async (lobbyCode: string) => {
            return Promise.resolve(false);
        });

        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'authenticateUserIfBanned').and.callThrough();
        const result = await privateSpy.call(component, '123', '22');
        expect(result).toBe(false);
    });

    @Component({ template: '' })
    class DummyAdminComponent {}
});
