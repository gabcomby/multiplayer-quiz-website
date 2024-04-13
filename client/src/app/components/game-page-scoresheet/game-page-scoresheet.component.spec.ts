import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerStatus } from '@app/interfaces/match';
import { SocketService } from '@app/services/socket/socket.service';
import { GamePageScoresheetComponent } from './game-page-scoresheet.component';

describe('GamePageScoresheetComponent', () => {
    let component: GamePageScoresheetComponent;
    let fixture: ComponentFixture<GamePageScoresheetComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['onPlayerStatusChanged', 'sendChatPermission']);

        TestBed.configureTestingModule({
            declarations: [GamePageScoresheetComponent],
            imports: [MatSortModule, MatTableModule, NoopAnimationsModule],
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
});
