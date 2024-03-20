import { Room } from '@app/classes/room';
import { IPlayer } from '@app/model/match.model';
import { rooms } from '@app/module';
import { RoomAuthService } from '@app/services/room-auth.service';
import { expect } from 'chai';

describe('RoomAuthService', () => {
    let service: RoomAuthService;
    let player: IPlayer;
    let roomId: string;
    let room: Partial<Room>;

    beforeEach(() => {
        service = new RoomAuthService();
        player = {
            id: 'testId',
            name: 'Test Player',
            score: 0,
            bonus: 0,
        } as IPlayer;

        room = {
            bannedNames: [],
            playerList: new Map(),
            roomLocked: false,
        };
        roomId = 'testRoomId';
    });

    it('should deny access for named "organisateur"', async () => {
        player.name = 'Organisateur';
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(false);
    });

    it('should deny access for banned player', async () => {
        const bannedNames = [player.name.toLowerCase()];
        room.bannedNames = bannedNames;
        rooms.set(roomId, room as Room);

        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(false);
    });

    it('should deny access for player already in room', async () => {
        const playerList = new Map<string, IPlayer>();
        playerList.set(player.id, player);
        room.playerList = playerList;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(false);
    });

    it('should deny access if room is locked', async () => {
        room.roomLocked = true;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(false);
    });

    it('should allow access if none of the conditions are met', async () => {
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(true);
    });

    it('should return false if game is already launched', async () => {
        room.gameHasStarted = true;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(false);
    });

    it('should deny access if room does not exist', async () => {
        const roomIdFake = 'fakeRoomId';
        const result = await service.verifyPlayerCanJoinRoom(roomIdFake, player);
        expect(result).to.equal(false);
    });
});
