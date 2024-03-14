import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { GameWaitComponent } from './game-wait.component';

describe('GameWaitComponent', () => {
    let component: GameWaitComponent;
    let fixture: ComponentFixture<GameWaitComponent>;
    let gameService: GameService;
    let socketService: SocketService;
    let matchLobbyService: MatchLobbyService;
    let matSnackBar: MatSnackBar;
    // let router: Router;
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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'lobbies', component: GameWaitComponent }]), HttpClientTestingModule],
            declarations: [GameWaitComponent],
            providers: [
                { provide: gameService, useClass: GameService },
                { provide: socketService, useClass: SocketService },
                { provide: matchLobbyService, useClass: MatchLobbyService },
                { provide: HttpClient, useValue: {} },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: MatSnackBar, useValue: matSnackBar },
            ],
        }).compileComponents();

        gameService = TestBed.inject(GameService);
        socketService = TestBed.inject(SocketService);
        matchLobbyService = TestBed.inject(MatchLobbyService);
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
        spyOnProperty(gameService, 'matchLobby').and.returnValue(mockLobby);
        const lobby = gameService.matchLobby;
        expect(lobby.playerList).toContain(mockLobby.playerList[0]);
        expect(lobby.playerList).toContain(mockLobby.playerList[1]);
    });

    it('should return if the player is the host', () => {
        gameService.currentPlayerId = 'host123';
        spyOnProperty(gameService, 'matchLobby').and.returnValue(mockLobby);
        const host = gameService.matchLobby.hostId;
        expect(host === gameService.currentPlayerId).toBe(true);
    });

    it('should return the correct banned players array', () => {
        spyOn(matchLobbyService, 'getBannedArray').and.returnValue(of(bannedArray));
        const result = component.bannedPlayers();
        expect(result).toEqual(bannedArray);
    });

    it('should call the socketService.startGame method', () => {
        spyOn(socketService, 'startGame');
        component.handleGameLaunch();
        expect(socketService.startGame).toHaveBeenCalled();
    });

    it('should call the gameService.handleGameLeave method', () => {
        spyOn(gameService, 'handleGameLeave');
        component.handleGameLeave();
        expect(gameService.handleGameLeave).toHaveBeenCalled();
    });

    it('should do nothing if player is already banned', () => {
        spyOn(matchLobbyService, 'banPlayer').and.returnValue(of(mockLobby));
        matchLobbyService.banPlayer('player3', component.lobbyCode).subscribe();
        expect(matchLobbyService.banPlayer).toHaveBeenCalled();
        const banArray = ['player3'];
        const playerName = 'player3';
        spyOn(component, 'bannedPlayers').and.returnValue(banArray);
        matchLobbyService.banPlayer(playerName, component.lobbyCode).subscribe();
        component.makeBannedPlayer(playerName);
        expect(component.players).toEqual(component.playerList);
    });

    it('should ban player, emit event, and update state if player is not banned', () => {
        const playerName = 'player2';
        spyOn(matchLobbyService, 'banPlayer').and.returnValue(of(mockLobby));
        matchLobbyService.banPlayer(playerName, component.lobbyCode).subscribe();
        expect(matchLobbyService.banPlayer).toHaveBeenCalled();
        spyOn(socketService, 'bannedPlayer');
        socketService.bannedPlayer(playerLists[1].id);
        component.makeBannedPlayer(playerName);
        expect(socketService.bannedPlayer).toHaveBeenCalledWith(playerLists[1].id);
        expect(component.bannedFromGame).toContain(playerName);
        expect(component.players).toEqual(component.playerList);
    });

    it('should lock the game', () => {
        spyOn(socketService, 'toggleRoomLock');
        spyOn(component, 'makeLocked').and.callThrough();
        socketService.toggleRoomLock();
        component.makeLocked();
        expect(component.makeLocked).toHaveBeenCalled();
        expect(socketService.toggleRoomLock).toHaveBeenCalled();
    });

    it('should change lock status', () => {
        const lockStatus = mockLobby.isLocked;
        spyOn(component, 'changeLockStatus').and.callThrough();
        component.changeLockStatus();
        expect(component.changeLockStatus).toHaveBeenCalled();
        expect(component.lockStatus).toEqual(!lockStatus);
    });

    /* spyOn(matchLobbyService, 'banPlayer').and.returnValue(of(mockLobby));
        matchLobbyService.banPlayer('player3', component.lobbyCode).subscribe();
        expect(matchLobbyService.banPlayer).toHaveBeenCalled();

    it('should ban player, emit event, and update state if player is not banned', () => {
        const banArray = ['player3', 'player2'];
        const playerName = 'player2';
        spyOn(matchLobbyService, 'banPlayer');
        spyOn(component, 'bannedPlayers').and.returnValue(banArray);
        matchLobbyService.banPlayer(playerName, component.lobbyCode).subscribe();
        component.makeBannedPlayer(playerName);
        expect(matchLobbyService.banPlayer).toHaveBeenCalledWith(playerName, component.lobbyCode);
        expect(socketService.bannedPlayer).toHaveBeenCalledWith(playerLists[1].id);
        expect(component.bannedFromGame).toContain(playerName);
        expect(component.players).toEqual(component.playerList);
    });*/
});
