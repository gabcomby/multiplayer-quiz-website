import { Room, RoomState } from '@app/classes/room';
import { IPlayer } from '@app/model/match.model';
import { rooms } from '@app/module';
import { RoomAuthService } from '@app/services/room-auth/room-auth.service';
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

    it('should deny access for player already in room trimmed', async () => {
        room.roomState = RoomState.WAITING;
        const playerList = new Map<string, IPlayer>();
        const player2 = {
            id: 'testId',
            name: '   Test Player    ',
            score: 0,
            bonus: 0,
        } as IPlayer;
        const player3 = {
            id: 'teses',
            name: 'Testing',
            score: 0,
            bonus: 0,
        } as IPlayer;
        playerList.set(player.id, player);
        room.playerList = playerList;
        const bannedNames = [player3.name.toLowerCase()];
        room.bannedNames = bannedNames;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player3);
        const result2 = await service.verifyPlayerCanJoinRoom(roomId, player2);
        expect(result).to.equal(false);
        expect(result2).to.equal(false);
    });
    it('should accept access for player not already in room', async () => {
        room.roomLocked = false;
        room.roomState = RoomState.WAITING;
        const playerList = new Map<string, IPlayer>();
        playerList.set(player.id, player);
        room.playerList = playerList;
        rooms.set(roomId, room as Room);
        const player2 = {
            id: 'teses',
            name: 'Test',
            score: 0,
            bonus: 0,
        } as IPlayer;
        const result = await service.verifyPlayerCanJoinRoom(roomId, player2);
        expect(result).to.equal(true);
    });

    it('should deny access if room is locked', async () => {
        room.roomState = RoomState.WAITING;
        room.roomLocked = true;
        const playerList = new Map<string, IPlayer>();
        playerList.set(player.id, player);
        room.playerList = playerList;
        rooms.set(roomId, room as Room);
        const player2 = {
            id: 'teses',
            name: 'Test',
            score: 0,
            bonus: 0,
        } as IPlayer;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player2);
        expect(result).to.equal(false);
    });

    it('should allow access if none of the conditions are met', async () => {
        room.roomState = RoomState.WAITING;
        rooms.set(roomId, room as Room);
        const result = await service.verifyPlayerCanJoinRoom(roomId, player);
        expect(result).to.equal(true);
    });

    it('should return false if game is already launched', async () => {
        room.roomState = RoomState.PLAYING;
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
