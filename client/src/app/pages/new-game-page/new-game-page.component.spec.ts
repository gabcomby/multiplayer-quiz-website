/* eslint max-lines: off */
/* import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; // MatDialogModule,
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { NewGamePageComponent } from './new-game-page.component';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    // let matchLobbyServiceSpy: jasmine.SpyObj<MatchLobbyService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketSpy: jasmine.SpyObj<Socket>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    const gamesMockFalseTrue: Game[] = [
        {
            id: 'un',
            title: 'game1',
            description: 'description1',
            isVisible: false,
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
    ];
    const gamesMockTrueTrue: Game[] = [
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
    ];
    const gamesMockTrueFalse: Game[] = [
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
            isVisible: false,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
    ];

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
    ];

    const gamesMockIsVisibleTrue: Game[] = [
        {
            id: 'un',
            title: 'game1',
            description: 'description1',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
    ];
    const gamesMockIsVisibleFalse: Game[] = [
        {
            id: 'un',
            title: 'game1',
            description: 'description1',
            isVisible: false,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
    ];
    const matchLobbyMock = {
        id: 'matchLobby1',
        playerList: [
            { id: 'host1', name: 'TestUser', score: 0, isLocked: false },
            { id: 'player2', name: 'TestUser2', score: 0, isLocked: false },
        ],
        gameId: 'game1',
        bannedNames: ['allo'],
        lobbyCode: '1234',
        isLocked: false,
        hostId: 'host1',
    };
    const gameSelectedMock = {
        un: true,
    };
    const gameSelectedMockTestModified = {
        un: true,
        deux: false,
    };
    /* const dialogMock = {
        open: () => {
            return { afterClosed: () => of(true) };
        },
    };
    beforeEach(async () => {
        const gameServiceObj = jasmine.createSpyObj('GameService', ['getGames']);
        const snackbarObj = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const socketObj = jasmine.createSpyObj('SocketService', ['connect', 'deleteId']);
        const socketIoObj = jasmine.createSpyObj('Socket', ['on']);
        const routerObj = jasmine.createSpyObj('Router', ['navigate']);
        const matchLobbyServiceObj = jasmine.createSpyObj('MatchLobbyService', ['getAllLobbies']);
        const matDialogObj = jasmine.createSpyObj('MatDialog', ['open', 'close']);
        const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
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
                { provide: MatchLobbyService, useValue: matchLobbyServiceObj },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MatDialog, useValue: matDialogObj },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            imports: [HttpClientModule, MatIconModule, MatToolbarModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        socketSpy = TestBed.inject(Socket) as jasmine.SpyObj<Socket>;
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        // matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        // matchLobbyServiceSpy = TestBed.inject(MatchLobbyService) as jasmine.SpyObj<MatchLobbyService>;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should change the bool of the gameSelected array when function getInformations() is called', async () => {
        component.gameSelected = gameSelectedMock;
        component.selected(gamesMock[0]);
        expect(gameSelectedMock['un']).toEqual(false);
    });
    it('should initialize games the array', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMock);
        socketServiceSpy.connect();
        const deleteEventSpy = await spyOn(component, 'deleteGameEvent');
        spyOn(component, 'ngOnInit').and.callThrough();
        spyOn(component, 'initializeSocket');
        component.deleteGameEvent('un');
        component.ngOnInit();
        expect(socketServiceSpy.connect).toHaveBeenCalled();
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(component.initializeSocket).toHaveBeenCalled();
        expect(deleteEventSpy).toHaveBeenCalled();
    });
    it('should push gameId', async () => {
        const gameStringId = 'un';
        const gamesUnderscoreIdMock: string[] = [];
        component.gamesUnderscoreId = gamesUnderscoreIdMock;
        const pushSpy = spyOn(component.gamesUnderscoreId, 'push');
        component.gamesUnderscoreId.push(gameStringId);
        expect(pushSpy).toHaveBeenCalledWith(gameStringId);
    });
    it('should call the on method when initialized socket is called', async () => {
        const deleteGameEventSpy = spyOn(component, 'deleteGameEvent');
        socketServiceSpy.deleteId();
        spyOn(component, 'initializeSocket').and.callThrough();
        component.initializeSocket();
        socketSpy.on('deleteId', async (gameId: string) => {
            await component.deleteGameEvent(gameId);
        });
        component.deleteGameEvent('un');
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.initializeSocket).toHaveBeenCalled();
        expect(socketSpy.on).toHaveBeenCalled();
        expect(socketServiceSpy.deleteId).toHaveBeenCalled();
        expect(deleteGameEventSpy).toHaveBeenCalled();
    });
    it('should return the good index of the game', async () => {
        const indexOfSpy = spyOn(gamesMock, 'indexOf').and.callThrough();
        const result = gamesMock.indexOf(gamesMock[0]);
        expect(indexOfSpy).toHaveBeenCalled();
        expect(result).toEqual(0);
    });
    it('should return true if game is not deleted or not hidden', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleTrue);
        routerSpy.navigate.and.callThrough();
        await component.isTheGameModifiedTest(gamesMockIsVisibleTrue[0]);
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', gamesMockIsVisibleTrue[0].id]);
    });
    it('should return true if game is not deleted or not hidden PLAY', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleTrue);
        routerSpy.navigate.and.callThrough();
        await component.isTheGameModifiedPlay(gamesMockIsVisibleTrue[0]);
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/gameWait', gamesMockIsVisibleTrue[0].id]);
    });
    it('should return false if game is deleted only game', async () => {
        spyOn(component, 'ngOnInit');
        const deletedGamesIdMock = ['un'];
        component.games = gamesMockIsVisibleTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleTrue);
        component.gameSelected = gameSelectedMockTestModified;
        await component.isTheGameModifiedTest(gamesMock[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockIsVisibleTrue[0].title + ' has been deleted' + ' we have no other games to suggest',
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(component.ngOnInit).toHaveBeenCalled();
        expect(gameSelectedMockTestModified).toEqual({ un: false, deux: false });
    });
    it('should return false if game is deleted last game', async () => {
        const deletedGamesIdMock = ['deux'];
        component.games = gamesMockTrueTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.returnValue(Promise.resolve([gamesMockTrueTrue[1]]));
        spyOn(component, 'isTheGameModified').and.returnValue(Promise.resolve(false));
        spyOn(component, 'createNewMatchLobby').and.returnValue(of(matchLobbyMock));
        component.createNewMatchLobby('TestUser', gamesMockTrueTrue[1].id).subscribe();
        const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefMock.afterClosed.and.returnValue(of(true));
        const result = await component.isTheGameModifiedPlay(gamesMockTrueTrue[1]);
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/gameWait', 'matchLobbyId', 'hostId']);
    });
    it('should return false if game is deleted first game', async () => {
        const deletedGamesIdMock = ['un'];
        component.games = gamesMockTrueTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMockTrueTrue);
        await component.isTheGameModifiedTest(gamesMockTrueTrue[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockTrueTrue[0].title + ' has been deleted' + ' we suggest you to play ' + gamesMockTrueTrue[1].title,
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
    });
    it('should return false if game is hidden only game', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleFalse);
        component.games = gamesMockIsVisibleTrue;
        await component.isTheGameModifiedTest(gamesMockIsVisibleFalse[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockIsVisibleFalse[0].title + ' has been hidden' + ' we have no other games to suggest',
        );
    });
    it('should return false if game is hidden first', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockFalseTrue);
        component.games = gamesMockFalseTrue;
        await component.isTheGameModifiedTest(gamesMockFalseTrue[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockFalseTrue[0].title + ' has been hidden' + ' we suggest you to play ' + gamesMockFalseTrue[1].title,
        );
    });
    it('should return false if game is hidden last one', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockTrueFalse);
        component.games = gamesMockTrueFalse;
        await component.isTheGameModifiedTest(gamesMockTrueFalse[1]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockTrueFalse[1].title + ' has been hidden' + ' we suggest to play ' + gamesMockTrueFalse[0].title,
        );
    });
    it('should return false if game is deleted only PLAY', async () => {
        const deletedGamesIdMock = ['un'];
        component.games = gamesMockIsVisibleTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleTrue);
        await component.isTheGameModifiedPlay(gamesMock[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockIsVisibleTrue[0].title + ' has been deleted' + ' we have no other games to suggest',
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
    });
    it('should return false if game is hidden only game PLAY', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockIsVisibleFalse);
        component.games = gamesMockIsVisibleTrue;
        await component.isTheGameModifiedPlay(gamesMockIsVisibleFalse[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockIsVisibleFalse[0].title + ' has been hidden' + ' we have no other games to suggest',
        );
    });
    it('should return false if game is hidden first PLAY', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockFalseTrue);
        component.games = gamesMockFalseTrue;
        await component.isTheGameModifiedPlay(gamesMockFalseTrue[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockFalseTrue[0].title + ' has been hidden' + ' we suggest you to play ' + gamesMockFalseTrue[1].title,
        );
    });
    it('should return false if game is hidden last one PLAY', async () => {
        gameServiceSpy.getGames.and.resolveTo(gamesMockTrueFalse);
        component.games = gamesMockTrueFalse;
        await component.isTheGameModifiedPlay(gamesMockTrueFalse[1]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockTrueFalse[1].title + ' has been hidden' + ' we suggest to play ' + gamesMockTrueFalse[0].title,
        );
    });
    it('should return false if game is deleted last game PLAY', async () => {
        const deletedGamesIdMock = ['deux'];
        component.games = gamesMockTrueTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMockTrueTrue);
        await component.isTheGameModifiedPlay(gamesMockTrueTrue[1]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockTrueTrue[1].title + ' has been deleted' + ' we suggest to play ' + gamesMockTrueTrue[0].title,
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
    });
    it('should return false if game is deleted first game PLAY', async () => {
        const deletedGamesIdMock = ['un'];
        component.games = gamesMockTrueTrue;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMockTrueTrue);
        await component.isTheGameModifiedPlay(gamesMockTrueTrue[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMockTrueTrue[0].title + ' has been deleted' + ' we suggest you to play ' + gamesMockTrueTrue[1].title,
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
    });
    it('should add gameId to deletedGamesId and show snackbar if the game was selected', () => {
        const gameIdToDelete = 'un';
        component.games = gamesMock;
        component.gameSelected = { [gameIdToDelete]: true };
        component.gamesUnderscoreId = [];
        snackbarServiceSpy.openSnackBar.calls.reset();
        component.deleteGameEvent(gameIdToDelete);
        expect(component.gamesUnderscoreId).toContain(gameIdToDelete);
        expect(component.deletedGamesId).toContain(gameIdToDelete);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Game ' + gameIdToDelete + ' has been deleted');
    });
});*/
