import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { Player } from '@app/interfaces/match';
import { RoomService } from './room.service';

describe('RoomService', () => {
    let service: RoomService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RoomService, { provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
        });
        service = TestBed.inject(RoomService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should verify player can join a room', () => {
        const mockRoomId = 'roomId123';
        const mockPlayer: Player = { id: 'playerId456', name: 'Test Player' } as Player;
        const expectedResponse = true;

        service.verifyPlayerCanJoin(mockRoomId, mockPlayer).subscribe((response) => {
            expect(response).toEqual(expectedResponse);
        });

        const req = httpController.expectOne(`http://localhost:3000/rooms/${mockRoomId}/auth`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockPlayer);
        req.flush(expectedResponse);
    });
});
