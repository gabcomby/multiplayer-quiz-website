import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { GamePageScoresheetComponent } from '@app/components/game-page-scoresheet/game-page-scoresheet.component';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { GameWaitComponent } from './game-wait.component';

describe('GameWaitComponent', () => {
    let component: GameWaitComponent;
    let fixture: ComponentFixture<GameWaitComponent>;
    let gameService: GameService;
    let socketService: SocketService;
    let matSnackBar: MatSnackBar;
    let routerSpy: jasmine.SpyObj<Router>;
    const playerLeftValueMock = [
        {
            id: '1',
            name: 'player1',
            score: 0,
            bonus: 0,
        },
        {
            id: '2',
            name: 'player2',
            score: 0,
            bonus: 0,
        },
    ];
    const playerLists = [
        {
            id: '1',
            name: 'player1',
            score: 0,
            bonus: 0,
        },
        {
            id: '2',
            name: 'player2',
            score: 0,
            bonus: 0,
        },
    ];

    const bannedArray = ['player3'];
    const mockLobby = {
        id: '1',
        playerList: playerLists,
        gameId: 'ABCD',
        bannedNames: bannedArray,
        lobbyCode: '1234',
        isLocked: false,
        hostId: 'host123',
    };

    const mockLobbyIsLocked = {
        id: '2',
        playerList: playerLists,
        gameId: 'FCGB',
        bannedNames: bannedArray,
        lobbyCode: '4567',
        isLocked: true,
        hostId: 'host123',
    };

    beforeEach(async () => {
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let store: any = {};
        const mockLocalStorage = {
            getItem: (key: string): string => {
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) => {
                store[key] = `${value}`;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([{ path: 'lobbies', component: GameWaitComponent }]),
                HttpClientTestingModule,
                MatIconModule,
                MatToolbarModule,
            ],
            declarations: [GameWaitComponent],
            providers: [
                { provide: gameService, useClass: GameService },
                { provide: socketService, useClass: SocketService },
                { provide: HttpClient, useValue: {} },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: MatSnackBar, useValue: matSnackBar },
                { provide: Router, useValue: routerSpyObj },
                { provide: GamePageScoresheetComponent, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        gameService = TestBed.inject(GameService);
        socketService = TestBed.inject(SocketService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameWaitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the good player list', () => {
        spyOnProperty(gameService, 'playerListValue').and.returnValue(mockLobby.playerList);
        const lobby = gameService.playerListValue;
        expect(lobby).toContain(mockLobby.playerList[0]);
        expect(lobby).toContain(mockLobby.playerList[1]);
    });

    it('should return the good player left list', () => {
        spyOnProperty(gameService, 'playerLeftListValue').and.returnValue(playerLeftValueMock);
        const lobby = gameService.playerLeftListValue;
        expect(lobby).toContain(playerLeftValueMock[0]);
        expect(lobby).toContain(playerLeftValueMock[1]);
    });

    it('should return if the player is the host', () => {
        spyOnProperty(gameService, 'isHostValue').and.returnValue(true);
        const host = gameService.isHostValue;
        expect(host === gameService.isHostValue).toBe(true);
    });

    it('should return the good lobby code', () => {
        spyOnProperty(gameService, 'lobbyCodeValue').and.returnValue(mockLobby.lobbyCode);
        const code = gameService.lobbyCodeValue;
        expect(code).toEqual(mockLobby.lobbyCode);
    });

    it('should return the good lock status(false)', () => {
        spyOnProperty(gameService, 'roomIsLockedValue').and.returnValue(mockLobby.isLocked);
        const lock = gameService.roomIsLockedValue;
        expect(lock).toEqual(mockLobby.isLocked);
        expect(component.roomIsLocked).toEqual(mockLobby.isLocked);
    });

    it('should return the good lock status(true)', () => {
        spyOnProperty(gameService, 'roomIsLockedValue').and.returnValue(mockLobbyIsLocked.isLocked);
        const lockIsLocked = gameService.roomIsLockedValue;
        expect(lockIsLocked).toEqual(mockLobbyIsLocked.isLocked);
    });

    it('should return the good game title', () => {
        spyOnProperty(gameService, 'gameTitleValue').and.returnValue('ABCD');
        const title = gameService.gameTitleValue;
        expect(title).toEqual('ABCD');
    });
    it('should return the good game type', () => {
        spyOnProperty(gameService, 'gameTypeValue').and.returnValue(1);
        const type = gameService.gameTypeValue;
        const gameType = component.gameType;
        expect(gameType).toEqual(1);
        expect(type).toEqual(1);
    });

    it('should call the gameService.banPlayer method', () => {
        spyOn(gameService, 'banPlayer');
        component.banPlayer('player3');
        expect(gameService.banPlayer).toHaveBeenCalled();
    });

    it('should call the gameService.leaveRoom method', () => {
        spyOn(gameService, 'leaveRoom');
        component.handleGameLeave();
        expect(gameService.leaveRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call the socketService.toggleRoomLock method', () => {
        spyOn(socketService, 'toggleRoomLock');
        component.toggleRoomLock();
        expect(socketService.toggleRoomLock).toHaveBeenCalled();
    });

    it('should call the gameService.startGame method', () => {
        spyOn(gameService, 'startGame');
        component.handleGameLaunch();
        expect(gameService.startGame).toHaveBeenCalled();
    });

    it('should not navigate on ngOnInit if refreshedPage is not present', () => {
        component.ngOnInit();

        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to a page held in localStorage on ngOnInit if refreshedPage is present', () => {
        localStorage.setItem('refreshedPage', '/home');
        component.ngOnInit();

        expect(localStorage.removeItem).toHaveBeenCalledWith('refreshedPage');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call leaveRoom and set refreshedPage on beforeUnloadHandler', () => {
        spyOn(gameService, 'leaveRoom');
        const event = new Event('beforeunload');
        component.beforeUnloadHandler(event);

        expect(gameService.leaveRoom).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith('refreshedPage', '/home');
    });
});
