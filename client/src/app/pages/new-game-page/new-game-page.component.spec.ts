import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { Socket } from 'socket.io-client';
import { NewGamePageComponent } from './new-game-page.component';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketSpy: jasmine.SpyObj<Socket>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;

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

    const gameSelectedMock = {
        un: true,
    };

    beforeEach(async () => {
        const gameServiceObj = jasmine.createSpyObj('GameService', ['getGames']);
        const snackbarObj = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const socketObj = jasmine.createSpyObj('SocketService', ['connect']);
        const socketIoObj = jasmine.createSpyObj('Socket', ['on']);
        const routerObj = jasmine.createSpyObj('Router', ['navigate']);
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
            ],
            imports: [HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        socketSpy = TestBed.inject(Socket) as jasmine.SpyObj<Socket>;
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
        spyOn(component, 'ngOnInit').and.callThrough();
        spyOn(component, 'initializeSocket');
        component.ngOnInit();
        expect(socketServiceSpy.connect).toHaveBeenCalled();
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(component.initializeSocket).toHaveBeenCalled();
    });

    it('should call the on method when initialized socket is called', async () => {
        const initializeSocketSpy = spyOn(component, 'initializeSocket').and.callThrough();
        socketSpy.on('deleteId', async (gameId: string) => {
            await component.deleteGameEvent(gameId);
        });
        spyOn(component, 'deleteGameEvent');
        component.initializeSocket();
        component.deleteGameEvent('un');
        expect(initializeSocketSpy).toHaveBeenCalled();
        expect(socketSpy.on).toHaveBeenCalled();
        expect(component.deleteGameEvent).toHaveBeenCalledWith('un');
    });

    /* it('should notify if a game deleted is selected', async () => {
        component.deletedGamesId = ['un'];
        component.gameSelected = gameSelectedMock;
        const deleteGameEventSpy = spyOn(component, 'deleteGameEvent').and.callThrough();
        snackbarServiceSpy.openSnackBar('Game un has been deleted');
        component.deleteGameEvent('un');
        expect(deleteGameEventSpy).toHaveBeenCalledWith('un');
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Game un has been deleted');
    });*/

    /* it('sould add the game to gamesId when deleted and should alert if gameSelected was deleted', async () => {
        const deletedGamesIdMock = ['un'];
        component.deletedGamesId = deletedGamesIdMock;
        const selectedGameMock = { un: true };
        component.gameSelected = selectedGameMock;
        const deleteGameEventSpy = spyOn(component, 'deleteGameEvent');
        component.deleteGameEvent('un');
        expect(deleteGameEventSpy).toHaveBeenCalledWith('un');
    });*/

    it('should return the good index of the game', async () => {
        const indexOfSpy = spyOn(gamesMock, 'indexOf').and.callThrough();
        const result = gamesMock.indexOf(gamesMock[0]);
        expect(indexOfSpy).toHaveBeenCalled();
        expect(result).toEqual(0);
    });

    it('should return true if game is not deleted or not hidden', async () => {
        const gamesMock1: Game[] = [
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
        gameServiceSpy.getGames.and.resolveTo(gamesMock1);
        routerSpy.navigate.and.callThrough();
        const result = await component.isTheGameModifiedPlay(gamesMock[0]);
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(result).toEqual(true);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/gameWait', gamesMock[0].id]);
    });

    it('should return false if game is deleted', async () => {
        const deletedGamesIdMock = ['un'];
        const gamesMock1: Game[] = [
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
        component.games = gamesMock1;
        component.deletedGamesId = deletedGamesIdMock;
        gameServiceSpy.getGames.and.resolveTo(gamesMock1);
        const result = await component.isTheGameModifiedPlay(gamesMock[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMock1[0].title + ' has been deleted' + ' we have no other games to suggest',
        );
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
        expect(result).toEqual(false);
    });

    it('should return false if game is hidden', async () => {
        const gamesMock1: Game[] = [
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
        gameServiceSpy.getGames.and.resolveTo(gamesMock1);
        component.games = gamesMock1;
        const result = await component.isTheGameModifiedPlay(gamesMock[0]);
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith(
            'Game ' + gamesMock1[0].title + ' has been hidden' + ' we have no other games to suggest',
        );
        expect(result).toEqual(false);
    });

});
