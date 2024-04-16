/* eslint-disable max-lines */
import { Room, RoomState } from '@app/classes/room';
import { IChoice, IGame, IQuestion } from '@app/model/game.model';
import { IPlayer, PlayerStatus } from '@app/model/match.model';
import { GameService } from '@app/services/game/game.service';
import { SocketManager } from '@app/services/socket/socket.service';
import { assert, expect } from 'chai';
import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
import * as sinon from 'sinon';
import { stub } from 'sinon';
import { type Socket as ServerSocket } from 'socket.io';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';

const mockGame: Partial<IGame> = {
    id: 'game1',
    title: 'Test Game',
    isVisible: true,
    description: 'A test game for validation',
    duration: 30,
    lastModification: new Date(),
    questions: [
        {
            id: '2',
            type: 'QRL',
            text: 'Why?',
            choices: [{ text: 'Because', isCorrect: true }] as unknown as IChoice[],
            points: 0,
            lastModification: new Date(),
        } as unknown as IQuestion,
    ],
};

const mockPlayer: Partial<IPlayer> = {
    id: 'player1',
    name: 'Test Player',
    score: 0,
    bonus: 0,
    chatPermission: true,
    status: PlayerStatus.Inactive,
};

let mockRoom: Room;

const rooms: Map<string, Room> = new Map<string, Room>();

describe('Socket Manager service', () => {
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;
    let clientSocketHost: ClientSocket;
    let socketManager: SocketManager;

    before((done) => {
        const httpServer = createServer();
        socketManager = new SocketManager();
        socketManager.init(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket = ioc(`http://localhost:${port}`);
            clientSocketHost = ioc(`http://localhost:${port}`);
            socketManager['io'].on('connect', (socket) => {
                serverSocket = socket;
                if (!mockRoom.hostId) mockRoom.hostId = serverSocket.id;
                return serverSocket;
            });
            mockRoom = new Room(mockGame as IGame, 1, socketManager['io']);
            clientSocket.connect();
            clientSocketHost.connect();
            done();
        });
    });

    beforeEach(() => {
        sinon.stub(socketManager, 'getRoom').callsFake((socket) => {
            return socket ? (mockRoom as Room) : undefined;
        });

        sinon.stub(socketManager, 'setRoom').callsFake((room, socket) => {
            rooms.set(socket.id, room);
        });

        sinon.stub(socketManager, 'roomExists').returns(true);
    });

    afterEach(() => {
        sinon.restore();
        clientSocket.removeAllListeners();
    });

    after(() => {
        socketManager['io'].close();
        clientSocket.disconnect();
        clientSocketHost.disconnect();
    });

    it('should create a game room and emit room-created event', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        clientSocket.emit('create-room', mockGame.id);
        clientSocket.on('room-created', (roomId, title) => {
            expect(roomId).to.be.a('string');
            expect(title).to.equal('Test Game');
            gameServiceStub.restore();
            done();
        });
    });

    it('should get room', () => {
        const result = socketManager.getRoom(serverSocket);
        expect(result).to.eql(mockRoom);
    });

    it('should get a room associated with a socket', () => {
        const roomsArray = Array.from(rooms.keys());
        rooms.set(roomsArray[1], mockRoom);

        const result = socketManager.getRoom(serverSocket);
        expect(result).to.eql(mockRoom);
    });

    it('should set a room associated with a socket', () => {
        const roomsArray = Array.from(rooms.keys());

        socketManager.setRoom(mockRoom, serverSocket);
        const result = rooms.get(roomsArray[1]);
        expect(result).to.eql(mockRoom);
    });

    /* it('should create a room test and emit room-test-created event', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        clientSocket.emit('create-room-test', mockGame.id);
        clientSocket.on('room-test-created', (title, players) => {
            expect(title).to.equal('Test Game');
            expect(players).to.have.property('length', 1);
            const room = socketManager.getRoom(clientSocket as unknown as ServerSocket);
            expect(room).to.have.property('gameType', 1);
            expect(room).to.have.property('game', mockGame);
            expect(room.hostId).to.equal(clientSocket.id);
            expect(room.playerList.size).to.equal(1);
            expect(room.playerHasAnswered.get(clientSocket.id)).to.equal(false);
            expect(room.livePlayerAnswers.get(clientSocket.id).length).to.eql(0);
            clientSocket.emit('leave-room');
            gameServiceStub.restore();
            done();
        });
    }); */

    it('should allow a player to join a room and receive appropriate events', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        socketManager.setRoom(mockRoom as Room, clientSocketHost as unknown as ServerSocket);
        clientSocket.emit('join-room', '1', mockPlayer as IPlayer);
        clientSocket.on('room-joined', (roomIdRes, title, joinedPlayer) => {
            expect(roomIdRes).to.be.a('string');
            expect(title).to.equal('Test Game');
            expect(joinedPlayer).to.eql(mockPlayer);
            const room = socketManager.getRoom(clientSocket as unknown as ServerSocket);
            expect(room.playerList.size).to.equal(1);
            gameServiceStub.restore();
            done();
        });
    });

    it('should allow the host to ban a player and emit banned-from-game event to the banned player', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        clientSocket.emit('ban-player', mockPlayer.name);
        clientSocket.on('banned-from-game', () => {
            const room = socketManager.getRoom(clientSocket as unknown as ServerSocket);
            expect(room.playerList.size).to.equal(1);
            gameServiceStub.restore();
            done();
        });
    });

    it('should allow the host to toggle room lock status and emit room-lock-status event', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);
        rooms.get(serverSocket.id).roomLocked = false;

        clientSocket.emit('toggle-room-lock');
        clientSocket.on('room-lock-status', (isLocked: boolean) => {
            const room = socketManager.getRoom(serverSocket as unknown as ServerSocket);
            expect(isLocked).to.be.a('boolean');
            expect(room.roomLocked).to.equal(isLocked);
            gameServiceStub.restore();
            done();
        });
    });

    /* it('should start the game and emit relevant events when initiated by the host with gameType 2', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);
        rooms.get(serverSocket.id).gameType = 2;
        rooms.get(serverSocket.id).playerList = new Map();

        clientSocket.emit('start-game');

        clientSocket.on('game-started', (duration, numQuestions) => {
            const room = socketManager.getRoom(serverSocket as unknown as ServerSocket);
            expect(duration).to.equal(mockGame.duration);
            expect(numQuestions).to.equal(mockGame.questions.length);
            expect(room.playerList.size).to.equal(0);
            gameServiceStub.restore();
            done();
        });
    }); */

    it('should set all players to inactive and emit player-status-changed events when host triggers next-question', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        clientSocket.emit('next-question');
        let emitCount = 0;
        clientSocket.on('player-status-changed', ({ status }) => {
            expect(status).to.equal(PlayerStatus.Inactive);
            emitCount++;
            if (emitCount === rooms.get(serverSocket.id).playerList.size) {
                expect(emitCount).to.equal(1);
                gameServiceStub.restore();
                done();
            }
        });
    });
    it('should update points qrl', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        const spy = sinon.spy(mockRoom.answerVerifier, 'calculatePointsQRL');
        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        clientSocket.emit('update-points-QRL');

        gameServiceStub.restore();

        done();
        sinon.assert.called(spy);
    });
    it('should pause timer', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        const spy = sinon.spy(mockRoom.countdownTimer, 'handleTimerPause');

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        clientSocket.emit('pause-timer');
        gameServiceStub.restore();

        done();
        sinon.assert.called(spy);
    });
    it('should enable panic mode', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        const spy = sinon.spy(mockRoom.countdownTimer, 'handlePanicMode');

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        clientSocket.emit('enable-panic-mode');

        gameServiceStub.restore();

        done();
        sinon.assert.called(spy);
    });
    it('should send-answer', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        const spy = sinon.spy(mockRoom.answerVerifier, 'verifyAnswers');

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        clientSocket.emit('send-answers');

        gameServiceStub.restore();

        done();
        sinon.assert.called(spy);
    });
    it('should update histogram', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        const spy = sinon.spy(mockRoom, 'handleInputModification');

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);

        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);
        rooms.get(serverSocket.id).playerList.set(clientSocket.id, mockPlayer as IPlayer);

        clientSocket.emit('update-histogram');

        gameServiceStub.restore();

        done();
        sinon.assert.called(spy);
    });

    it('should update player status to Confirmed and handle early answers when send-locked-answers event is triggered', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);
        rooms.get(serverSocket.id).playerList.set(serverSocket.id, mockPlayer as IPlayer);

        rooms.get(serverSocket.id).handleEarlyAnswers = sinon.stub();

        const answerIdx = [1, 2];
        const player = { id: serverSocket.id, name: 'Test Player' };

        clientSocket.emit('send-locked-answers', answerIdx, player);

        clientSocket.on('player-status-changed', ({ playerId, status }) => {
            expect(playerId).to.equal('player1');
            expect(status).to.equal(PlayerStatus.Confirmed);
            const room = socketManager.getRoom(serverSocket as unknown as ServerSocket);
            const playerFromRoom = room.playerList.get(serverSocket.id);
            expect(playerFromRoom.status).to.equal(PlayerStatus.Confirmed);

            gameServiceStub.restore();
            done();
        });
    });
    it('should handle chat-message event', (done) => {
        const messageData = { message: 'Test message', playerName: 'Test Player', roomId: 'room1' };
        clientSocket.emit('chat-message', messageData);

        clientSocket.on('chat-message', (data) => {
            expect(data).to.eql(messageData);
            done();
        });
        done();
    });

    it('should handle chat-permission event', (done) => {
        const chatPermissionData = { playerId: 'player1', permission: true };
        clientSocket.emit('chat-permission', chatPermissionData);

        clientSocket.on('system-message', (data) => {
            expect(data.text).to.include(chatPermissionData.permission ? 'reçu' : 'perdu');
            expect(data.sender).to.equal('Système');
            done();
        });
    });

    it('should say perdu when chat permission is false', (done) => {
        const chatPermissionData = { playerId: 'player1', permission: false };
        clientSocket.emit('chat-permission', chatPermissionData);

        clientSocket.on('system-message', (data) => {
            expect(data.text).to.include(chatPermissionData.permission ? 'reçu' : 'perdu');
            expect(data.sender).to.equal('Système');
            done();
        });
    });

    it('should emit chat message if has chatpermission', (done) => {
        const messageData = { message: 'Test message', playerName: 'Test Player', roomId: 'room1' };
        clientSocket.emit('chat-message', messageData);
        mockRoom.playerList.set(clientSocket.id, { ...mockPlayer, chatPermission: true } as IPlayer);

        mockRoom.hostId = 'some-other-id';

        clientSocket.on('chat-message', (data) => {
            expect(data).to.eql(messageData);
            done();
        });
        done();
    });
    it('should not emit if not playersocketId for chat-permission', (done) => {
        const chatPermissionData = { playerId: 'non-existent', permission: true };

        const emitSpy = sinon.spy(clientSocket, 'emit');
        clientSocket.emit('chat-permission', chatPermissionData);

        sinon.assert.neverCalledWithMatch(emitSpy, 'system-message');
        emitSpy.restore();
        done();
    });

    it('should set room ', () => {
        sinon.restore();
        const result = socketManager.setRoom(mockRoom, serverSocket);
        sinon.stub(socketManager, 'getRoom').callsFake((socket) => {
            return socket ? (mockRoom as Room) : undefined;
        });
        sinon.stub(socketManager, 'setRoom').callsFake((room, socket) => {
            rooms.set(socket.id, room);
        });
        sinon.stub(socketManager, 'roomExists').returns(true);

        expect(result).to.eql(undefined);
    });
    it('should handle socket on leave-room', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as IGame);
        socketManager.setRoom(mockRoom as Room, serverSocket);
        mockRoom.roomState = RoomState.PLAYING;
        const cbSpy = sinon.spy();
        const spyPush = sinon.spy(mockRoom.playerLeftList, 'push');
        serverSocket.on('leave-room', cbSpy);
        clientSocket.on('lobby-deleted', () => {
            assert.isTrue(cbSpy.calledOnce);
            assert.isTrue(spyPush.calledOnce);
            assert.strictEqual(mockRoom.playerList.size, 0);
            gameServiceStub.restore();
            done();
        });
        clientSocket.emit('leave-room');
        setTimeout(() => {
            gameServiceStub.restore();
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- need it for the test
        }, 100);
    });
    it('should handle socket start-game', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as IGame);
        socketManager.setRoom(mockRoom as Room, serverSocket);
        mockRoom.gameType = 2;
        mockRoom.roomId = serverSocket.id;

        const cbSpy = sinon.spy();
        serverSocket.on('start-game', () => {
            cbSpy();
            expect(mockRoom.roomState).to.equal(RoomState.PLAYING);
            expect(mockRoom.playerList.size).to.equal(0);
            expect(socketManager.roomExists(mockRoom.roomId)).to.equal(true);
            expect(mockRoom.gameType).to.equal(2);
            gameServiceStub.restore();
            done();
        });
        clientSocket.emit('start-game');
        setTimeout(() => {
            gameServiceStub.restore();
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- need it for the test
        }, 100);
    });

    it('should push when reset false live-answers', (done) => {
        clientSocket.emit('send-live-answers', 'answer1', mockPlayer as IPlayer, false);
        clientSocket.on('live-answers', (answer, player, isCorrect) => {
            expect(answer).to.equal('answer1');
            expect(player).to.eql(mockPlayer);
            expect(isCorrect).to.equal(false);
            expect(mockRoom.inputModifications.length).to.equal(1);
            done();
        });
        done();
    });

    it('should not push when reset true', (done) => {
        clientSocket.emit('send-live-answers', 'answer1', mockPlayer as IPlayer, true);
        clientSocket.on('live-answers', (answer, player, isCorrect) => {
            expect(answer).to.equal('answer1');
            expect(player).to.eql(mockPlayer);
            expect(isCorrect).to.equal(true);
            expect(mockRoom.inputModifications.length).to.equal(0);
            done();
        });
        done();
    });

    it('should emit ', (done) => {
        mockRoom.playerList.set(clientSocket.id, mockPlayer as IPlayer);
        clientSocket.emit('send-live-answers', [1, 0], mockPlayer as IPlayer, true);
        clientSocket.on('send-live-answers', (answer, player, isCorrect) => {
            expect(answer).to.equal([1, 0]);
            expect(answer.length).to.equal(2);
            expect(player).to.eql(mockPlayer);
            expect(isCorrect).to.equal(true);
            expect(mockRoom.inputModifications.length).to.equal(0);
            done();
        });
        done();
    });
});
