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
import { Player } from '@app/interfaces/match';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthService } from '@app/services/auth.service';
import { GameService } from '@app/services/game.service';
import { RoomService } from '@app/services/room.service';
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
    let roomServiceSpy: jasmine.SpyObj<RoomService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['verifyRoomLock', 'onRoomLockStatus', 'connect', 'joinRoom']);
        roomServiceSpy = jasmine.createSpyObj('RoomServiceSpy', ['verifyPlayerCanJoin']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['resetGameVariables', 'setupWebsocketEvents']);

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
                { provide: RoomService, useValue: roomServiceSpy },
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

    it("should handle connection to lobby when handleGameJoin'", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isEmptyDialog').and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'verifyPlayerCanJoin');

        spyOn(snackbarService, 'openSnackBar');

        spyOn(dialog, 'open').and.callThrough();
        await component.handleGameJoin();
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should handle connection to lobby when handleGameJoin'", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isEmptyDialog').and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'verifyPlayerCanJoin');

        spyOn(snackbarService, 'openSnackBar');

        spyOn(dialog, 'open').and.callThrough();
        await component.handleGameJoin();
        expect(privateSpy).toHaveBeenCalled();
    });
    it("should add player to lobby when verifyPlayerCanJoin return true'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const newPlayer: Player = {
            name: result.userName,
            id: '123',
            score: 0,
            bonus: 0,
        };
        roomServiceSpy.verifyPlayerCanJoin.and.returnValue(of(true));

        spyOn(router, 'navigate');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'verifyPlayerCanJoin').and.callThrough();
        privateSpy.call(component, result, newPlayer);
        expect(router.navigate).toHaveBeenCalled();
        expect(socketServiceSpy.joinRoom).toHaveBeenCalled();
        expect(gameServiceSpy.resetGameVariables).toHaveBeenCalled();
        expect(gameServiceSpy.setupWebsocketEvents).toHaveBeenCalled();
    });
    it("should have error when error thrown with verifyPlayerCanJoin'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const newPlayer: Player = {
            name: result.userName,
            id: '123',
            score: 0,
            bonus: 0,
        };
        roomServiceSpy.verifyPlayerCanJoin.and.returnValue(throwError(() => new Error('error')));
        //
        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'verifyPlayerCanJoin').and.callThrough();
        privateSpy.call(component, result, newPlayer);
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });
    it("should have error when error thrown with verifyPlayerCanJoin'", async () => {
        const result = { userName: 'string', lobbyCode: 'string' };
        const newPlayer: Player = {
            name: result.userName,
            id: '123',
            score: 0,
            bonus: 0,
        };
        roomServiceSpy.verifyPlayerCanJoin.and.returnValue(of(false));
        //
        spyOn(snackbarService, 'openSnackBar');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = spyOn<any>(component, 'verifyPlayerCanJoin').and.callThrough();
        privateSpy.call(component, result, newPlayer);
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });

    @Component({ template: '' })
    class DummyAdminComponent {}
});
