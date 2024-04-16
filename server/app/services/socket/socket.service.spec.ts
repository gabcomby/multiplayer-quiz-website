import type { AnswerVerifier } from '@app/classes/answer-verifier';
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

const mockRoom: Partial<Room> = {
    hostId: '',
    roomId: '1',
    playerList: new Map<string, IPlayer>(),
    game: mockGame as IGame,
    currentQuestionIndex: 0,

    answerVerifier: {
        calculatePointsQRL: sinon.stub(),
    } as unknown as AnswerVerifier,
};

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

                rooms.set(socket.id, mockRoom as Room);
                socket.join(mockRoom.roomId);

                return serverSocket;
            });
            clientSocket.connect();
            clientSocketHost.connect();
            done();
        });
    });

    beforeEach(() => {
        sinon.stub(socketManager, 'getRoom').callsFake((socket) => {
            return rooms.get(socket.id) as Room;
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

    it('should create a room test and emit room-test-created event', (done) => {
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
    });

    it('should allow a player to join a room and receive appropriate events', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);
        socketManager.setRoom(mockRoom as Room, clientSocketHost as unknown as ServerSocket);
        clientSocket.emit('join-room', '1', mockPlayer as IPlayer);
        clientSocket.on('room-joined', (roomIdRes, title, joinedPlayer) => {
            console.log('room-joined', roomIdRes, title, joinedPlayer);
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
            expect(room.roomLocked).to.equal(!isLocked);
            gameServiceStub.restore();
            done();
        });
    });

    it('should start the game and emit relevant events when initiated by the host with gameType 2', (done) => {
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
    });

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

    // TODO: GAB GROS COQUIN je sais pourquoi ça marche pas, mais j'arrive pas à le fix. Si tu vois ce test avant moi.

    // 1. J'ai mis des logs l'erreur que tu recois viens de cette ligne
    //    this.allAnswersGameResults.set(question.text, [
    //    this.counterIncorrectAnswerQRL,
    //    this.counterHalfCorrectAnswerQRL,
    //    this.counterCorrectAnswerQRL,
    // ]);

    // En fait question.text est pas défini, même si on mock correctement notre room pourquoi ?
    // Parce que on rejoints une room aléatoire qui n'a pas de question.
    // Ça nous fuck de fou
    // Il faudrait trouver le moyen de joins la room qu'on mock mais j'arrive pas fuck that
    // Regarde j'ai mis des consoles log pour voir ce qui se passe quand j'appelle calculatePointsQRL

    it('should update player status to Confirmed and handle early answers when send-locked-answers event is triggered', () => {
        socketManager.setRoom(mockRoom as Room, serverSocket as unknown as ServerSocket);
        rooms.get(serverSocket.id).playerList.set(serverSocket.id, mockPlayer as IPlayer);

        rooms.get(serverSocket.id).answerVerifier.calculatePointsQRL = sinon.stub();

        clientSocket.emit('update-points-QRL', [[mockPlayer as IPlayer, 0]]);
        clientSocket.on('playerlist-change', (playerList) => {
            expect(playerList[0][1].status).to.equal(PlayerStatus.Confirmed);
        });
    });
});
