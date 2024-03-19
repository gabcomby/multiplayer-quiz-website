// import { IGame } from '@app/model/game.model';
// import { rooms } from '@app/module';
// import 'mocha';
// import * as sinon from 'sinon';
// import { Socket } from 'socket.io';
// import { GameService } from './game.service';
// import { RoomService } from './room.service';

// class MockSocketIO {
//     // eslint-disable-next-line -- This is a stub
//     callbacks: { [key: string]: (...args: any[]) => void } = {};
//     rooms: { [roomId: string]: MockSocketIO } = {};

//     emit = sinon.spy((event, ...args) => {
//         if (this.callbacks[event]) {
//             this.callbacks[event](...args);
//         }
//     });

//     join = sinon.spy((event, ...args) => {
//         if (this.callbacks[event]) {
//             this.callbacks[event](...args);
//         }
//     });

//     // eslint-disable-next-line -- This is a stub
//     on(event: string, callback: any) {
//         this.callbacks[event] = callback;
//     }

//     to(roomId: string) {
//         if (!this.rooms[roomId]) {
//             this.rooms[roomId] = new MockSocketIO();
//             this.rooms[roomId].callbacks = { ...this.callbacks };
//         }
//         return {
//             emit: this.emit,
//         };
//     }

//     // eslint-disable-next-line -- This is a stub
//     simulate(event: string, ...args: any[]) {
//         if (this.callbacks[event]) {
//             (this.callbacks[event] as (...args: unknown[]) => void)(...args);
//         }
//     }
// }

// describe('RoomService', () => {
//     let roomService: RoomService;
//     let mockGameService: sinon.SinonStubbedInstance<GameService>;
//     let mockIo: MockSocketIO;
//     let mockSocket: Socket;
//     let gameId: string;

//     beforeEach(() => {
//         mockGameService = sinon.createStubInstance(GameService);
//         mockSocket = new Socket();
//         mockIo = new MockSocketIO();
//         roomService = new RoomService(mockGameService);

//         gameId = '1a2b3c';

//         mockGameService.getGame.resolves({
//             id: gameId,
//             title: 'Test Game',
//             description: 'A test game',
//             duration: 60,
//             questions: [],
//             lastModification: new Date(),
//         } as IGame);

//         rooms.clear();
//     });

//     afterEach(() => {
//         sinon.restore();
//     });

//     // it('should handle room creation', async () => {
//     //     await roomService.handleRoomCreation(gameId, mockIo, mockSocket);

//     //     expect(rooms.size).to.equal(1);
//     //     const room = rooms.values().next().value;
//     //     expect(room.game.id).to.equal(gameId);
//     //     sinon.assert.calledWith(mockSocket.join, sinon.match.string);
//     //     sinon.assert.calledWith(mockSocket.emit, 'room-created', sinon.match.string, 'Test Game');
//     // });

//     // it('should handle test room creation and add player', async () => {
//     //     const player: IPlayer = { id: 'playerId', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
//     //     await roomService.handleTestRoomCreation(gameId, player, mockIo as unknown, mockSocket as unknown);

//     //     expect(rooms.size).to.equal(1);
//     //     const room = rooms.values().next().value;
//     //     expect(room.playerList.has(player.id)).to.be.true;
//     //     sinon.assert.calledWith(mockSocket.join, sinon.match.string);
//     //     sinon.assert.calledWith(mockIo.emit, 'room-test-created', 'Test Game', sinon.match.any);
//     // });

//     // it('should handle room join', () => {
//     //     const player: IPlayer = { id: 'playerId', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
//     //     roomService.handleRoomCreation(gameId, mockIo as unknown, mockSocket as unknown);

//     //     const joiningSocket = new MockSocketIO();
//     //     const roomId = rooms.keys().next().value;

//     //     roomService.handleRoomJoin(roomId, player, mockIo as unknown, joiningSocket as unknown);

//     //     expect(rooms.get(roomId).playerList.has(player.id)).to.be.true;
//     //     sinon.assert.calledWith(joiningSocket.join, roomId);
//     // });

//     // it('should handle room leave and delete room if empty', () => {
//     //     const player: IPlayer = { id: 'playerId', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
//     //     roomService.handleTestRoomCreation(gameId, player, mockIo as unknown, mockSocket as unknown);
//     //     const roomId = rooms.keys().next().value;

//     //     roomService.handleRoomLeave(mockIo as unknown, mockSocket as unknown);

//     //     expect(rooms.size).to.equal(0);
//     //     sinon.assert.calledWith(mockIo.emit, 'lobby-deleted');
//     // });

//     // // Add more tests as necessary for your implementation details
// });
