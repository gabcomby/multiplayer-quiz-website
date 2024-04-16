import { Room } from '@app/classes/room';
import { IChoice, IGame, IQuestion } from '@app/model/game.model';
import { IPlayer, PlayerStatus } from '@app/model/match.model';
import { GameService } from '@app/services/game/game.service';
import { SocketManager } from '@app/services/socket/socket.service';
import { expect } from 'chai';
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
});
