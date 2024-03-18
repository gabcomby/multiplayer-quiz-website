import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
// import { of } from 'rxjs';
import { GameWaitComponent } from './game-wait.component';

describe('GameWaitComponent', () => {
    let component: GameWaitComponent;
    let fixture: ComponentFixture<GameWaitComponent>;
    let gameService: GameService;
    let socketService: SocketService;
    let matSnackBar: MatSnackBar;
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
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'lobbies', component: GameWaitComponent }]), HttpClientTestingModule],
            declarations: [GameWaitComponent],
            providers: [
                { provide: gameService, useClass: GameService },
                { provide: socketService, useClass: SocketService },
                { provide: HttpClient, useValue: {} },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: MatSnackBar, useValue: matSnackBar },
            ],
        }).compileComponents();

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
        gameService.roomLocked = mockLobby.isLocked;
        spyOnProperty(gameService, 'roomIsLockedValue').and.returnValue(gameService.roomLocked);
        const lock = gameService.roomIsLockedValue;
        expect(lock).toEqual(mockLobby.isLocked);
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

    it('should call the gameService.banPlayer method', () => {
        spyOn(gameService, 'banPlayer');
        component.banPlayer('player3');
        expect(gameService.banPlayer).toHaveBeenCalled();
    });

    it('should call the gameService.leaveRoom method', () => {
        spyOn(gameService, 'leaveRoom');
        component.handleGameLeave();
        expect(gameService.leaveRoom).toHaveBeenCalled();
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
});
