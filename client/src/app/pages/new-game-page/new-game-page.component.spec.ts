/* eslint max-lines: off */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; // MatDialogModule,
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { ApiService } from '@app/services/api.service';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
// import { ArrayType } from '@angular/compiler';
import { API_BASE_URL } from '@app/app.module';
import { Socket } from 'socket.io-client';
import { NewGamePageComponent } from './new-game-page.component';
// import { get } from 'http';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    // let matchLobbyServiceSpy: jasmine.SpyObj<MatchLobbyService>;
    // let socketServiceSpy: jasmine.SpyObj<SocketService>;
    // let gameServiceSpy: jasmine.SpyObj<GameService>;
    // let socketSpy: jasmine.SpyObj<Socket>;
    // let routerSpy: jasmine.SpyObj<Router>;
    // let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let apiService: ApiService;
    // let array: ArrayType;
    const gamesMock: Game[] = [
        {
            id: 'un',
            title: 'game1',
            description: 'description1',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
        {
            id: 'deux',
            title: 'game2',
            description: 'description2',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
        {
            id: 'trois',
            title: 'game3',
            description: 'description3',
            isVisible: false,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
    ];
    beforeEach(async () => {
        const gameServiceObj = jasmine.createSpyObj('GameService', ['getGames']);
        const snackbarObj = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const socketObj = jasmine.createSpyObj('SocketService', ['connect', 'deleteId']);
        const socketIoObj = jasmine.createSpyObj('Socket', ['on']);
        const routerObj = jasmine.createSpyObj('Router', ['navigate']);
        const matDialogObj = jasmine.createSpyObj('MatDialog', ['open', 'close']);
        const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        const arrayMock = jasmine.createSpyObj('Array', ['indexOf', 'push']);
        await TestBed.configureTestingModule({
            declarations: [NewGamePageComponent],
            providers: [
                GameService,
                SocketService,
                { provide: GameService, useValue: gameServiceObj },
                { provide: SocketService, useValue: socketObj },
                { provide: SnackbarService, useValue: snackbarObj },
                { provide: Socket, useValue: socketIoObj },
                { provide: Router, useValue: routerObj },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MatDialog, useValue: matDialogObj },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: Array, useValue: arrayMock },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
            imports: [HttpClientModule, MatIconModule, MatToolbarModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        // socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        // socketSpy = TestBed.inject(Socket) as jasmine.SpyObj<Socket>;
        // snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        // routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        apiService = TestBed.inject(ApiService);

        // matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        // matchLobbyServiceSpy = TestBed.inject(MatchLobbyService) as jasmine.SpyObj<MatchLobbyService>;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should get games', async () => {
        spyOn(apiService, 'getGames').and.returnValue(Promise.resolve(gamesMock));
        await component.ngOnInit();
        expect(component.games).toEqual(gamesMock);
    });

    it('should select a game', () => {
        spyOn(component, 'selected').and.callThrough();
        const game = gamesMock[0];
        component.selected(game);
        expect(component.gameSelected[game.id]).toBeTrue();
    });

    it('should return the good index of the game', async () => {
        const indexOfSpy = spyOn(gamesMock, 'indexOf').and.callThrough();
        const result = gamesMock.indexOf(gamesMock[0]);
        expect(indexOfSpy).toHaveBeenCalled();
        expect(result).toEqual(0);
    });

    /* it('should delete a game', () => {
        spyOn(component, 'deleteGameEvent').and.callThrough();
        const gameId = gamesMock[0].id;
        const arrayMock = {
            push: jasmine.createSpy('push').and.callThrough(),
        };
        /* const game = gamesMock[0];
        const gameSugg = {
            id: '',
            title: '',
            description: '',
            isVisible: false,
            lastModification: new Date(),
            duration: 0,
            questions: [],
        };
        const result = component.deleteGameEvent(gameId);
        expect(arrayMock.push).toHaveBeenCalled();
        expect(result).toBeUndefined();
        expect(component.deletedGamesId).toContain(gameId);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalled();
    });*/
    it('should suggest a game', () => {
        const spySuggest = spyOn(component, 'suggestGame').and.callThrough();
        const getGameSpy = spyOn(apiService, 'getGame').and.returnValue(of(gamesMock[0]));
        const canItBeSuggestedSpy = spyOn(component, 'canItBeSuggested').and.returnValue(true);
        const game = gamesMock[0];
        spySuggest.and.returnValue(gamesMock[0].title);
        const result = component.suggestGame(game);
        expect(result).toEqual('game1');
        expect(getGameSpy).toHaveBeenCalled();
        expect(canItBeSuggestedSpy).toHaveBeenCalled();
    });

    it('sould return true if the game can be suggested', () => {
        const game = gamesMock[0];
        const oldGame = gamesMock[1];
        spyOn(component, 'canItBeSuggested').and.callThrough();
        const result = component.canItBeSuggested(game, oldGame);
        expect(result).toBeTrue();
    });
    it('sould return false if the game can not be suggested', () => {
        const game = gamesMock[2];
        const oldGame = gamesMock[1];
        spyOn(component, 'canItBeSuggested').and.callThrough();
        const result = component.canItBeSuggested(game, oldGame);
        expect(result).toBeFalse();
    });
    it('sould return false if the game can not be suggested', () => {
        const game = gamesMock[1];
        const oldGame = gamesMock[1];
        spyOn(component, 'canItBeSuggested').and.callThrough();
        const result = component.canItBeSuggested(game, oldGame);
        expect(result).toBeFalse();
    });
});
