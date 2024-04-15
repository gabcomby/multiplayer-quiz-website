import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Player, PlayerStatus } from '@app/interfaces/match';
import { SocketService } from '@app/services/socket/socket.service';
import { GamePageScoresheetComponent } from './game-page-scoresheet.component';
import { MatCardModule } from '@angular/material/card';

describe('GamePageScoresheetComponent', () => {
    let component: GamePageScoresheetComponent;
    let fixture: ComponentFixture<GamePageScoresheetComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['onPlayerStatusChanged', 'sendChatPermission']);

        TestBed.configureTestingModule({
            declarations: [GamePageScoresheetComponent],
            imports: [MatSortModule, MatTableModule, NoopAnimationsModule, MatCardModule],
            providers: [{ provide: SocketService, useValue: socketServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageScoresheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize dataSource sort on ngOnInit', () => {
        expect(component.dataSource.sort).toEqual(component.sort);
    });

    // Example for testing socket integration (adjust as necessary)
    it('should update player status when notified by the socket service', () => {
        const initialPlayerList = [
            { id: 'p1', name: 'Player One', score: 100, status: 1, bonus: 0 },
            { id: 'p2', name: 'Player Two', score: 200, status: 2, bonus: 0 },
        ];
        component.dataSource.data = initialPlayerList;

        const updatedStatus = PlayerStatus.Inactive;
        socketServiceSpy.onPlayerStatusChanged.and.callFake((callback) => {
            callback({ playerId: 'p1', status: updatedStatus });
        });

        component.listenForPlayerStatusChanges();
        expect(component.dataSource.data[0].status).toBe(updatedStatus);
    });
    it('should handle playerList changes correctly', () => {
        const changes: SimpleChanges = {
            playerList: {
                currentValue: [
                    { name: 'Alice', score: 10 },
                    { name: 'Bob', score: 15, chatPermission: false },
                    { name: 'Charlie', score: 15 },
                ],
                previousValue: [],
                firstChange: true,
                isFirstChange: () => true,
            },
        };

        component.playerList = changes.playerList.currentValue;
        component.ngOnChanges(changes);

        expect(component.dataSource.data.length).toBe(3);
    });
    it('should handle playerList changes correctly if order is not good', () => {
        const changes: SimpleChanges = {
            playerList: {
                currentValue: [
                    { name: 'Alice', score: 20 },
                    { name: 'Bob', score: 15, chatPermission: false },
                    { name: 'Charlie', score: 15 },
                ],
                previousValue: [],
                firstChange: true,
                isFirstChange: () => true,
            },
        };

        component.playerList = changes.playerList.currentValue;
        component.ngOnChanges(changes);

        expect(component.dataSource.data.length).toBe(3);
    });
    it('should toggle chat permission', () => {
        const player: Player = {
            name: 'test',
            score: 2,
            id: '123',
            bonus: 1,
        };
        component.toggleChatPermission(player);
        expect(socketServiceSpy.sendChatPermission).toHaveBeenCalled();
    });
    it('should return "inactive-player" for an inactive player', () => {
        const player: Player = {
            name: 'test',
            score: 2,
            id: '123',
            bonus: 1,
            status: PlayerStatus.Inactive,
        };
        const result = component.getStatusClass(player);
        expect(result).toBe('inactive-player');
    });

    it('should return "active-player" for an active player', () => {
        const player: Player = {
            name: 'test',
            score: 2,
            id: '123',
            bonus: 1,
            status: PlayerStatus.Active,
        };
        const result = component.getStatusClass(player);
        expect(result).toBe('active-player');
    });

    it('should return "confirmed-player" for a confirmed player', () => {
        const player: Player = {
            name: 'test',
            score: 2,
            id: '123',
            bonus: 1,
            status: PlayerStatus.Confirmed,
        };
        const result = component.getStatusClass(player);
        expect(result).toBe('confirmed-player');
    });

    it('should return an empty string for an unknown status', () => {
        const player: Player = {
            name: 'test',
            score: 2,
            id: '123',
            bonus: 1,
        };
        const result = component.getStatusClass(player);
        expect(result).toBe('');
    });
    it('should return "Inactive" when the status is PlayerStatus.Inactive', () => {
        const result = component.getPlayerStatus(PlayerStatus.Inactive);
        expect(result).toBe('Inactive');
    });
    it('should return "Active" when the status is PlayerStatus.Active', () => {
        const result = component.getPlayerStatus(PlayerStatus.Active);
        expect(result).toBe('Active');
    });

    it('should return "Confirmed" when the status is PlayerStatus.Confirmed', () => {
        const result = component.getPlayerStatus(PlayerStatus.Confirmed);
        expect(result).toBe('Confirmed');
    });

    it('should return an empty string for an unknown status', () => {
        const unknownStatus = 999;
        const result = component.getPlayerStatus(unknownStatus);
        expect(result).toBe('');
    });
});
