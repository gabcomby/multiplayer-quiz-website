import type { Room } from '@app/classes/room';
import { IChoice, IGame, IQuestion } from '@app/model/game.model';
import { IPlayer, PlayerStatus } from '@app/model/match.model';
import { GameService } from '@app/services/game/game.service';
import { SocketManager } from '@app/services/socket/socket.service';
import { expect } from 'chai';
import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
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
};

describe('Socket Manager service', () => {
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;
    /*     let hostSocket: ClientSocket; */
    let socketManager: SocketManager;

    before((done) => {
        const httpServer = createServer();
        socketManager = new SocketManager();
        socketManager.init(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket = ioc(`http://localhost:${port}`);
            /*             hostSocket = ioc(`http://localhost:${port}`); */
            socketManager['io'].on('connect', (socket) => {
                serverSocket = socket;

                // eslint-disable-next-line
                console.log('Socket connected', serverSocket.id);
                if (!mockRoom.hostId) {
                    mockRoom.hostId = serverSocket.id;
                }

                // serverSocket.join(mockRoom.roomId);
                // serverSocket.to(mockRoom.roomId).emit('room-joined', mockRoom.roomId, mockRoom.game.title, mockPlayer);
                // mockRoom.playerList.set(socket.id, mockPlayer as IPlayer);

                // eslint-disable-next-line
                console.log('Mock Room', mockRoom);

                return serverSocket;
            });
            clientSocket.connect();
            /*         hostSocket.connect(); */
            done();
        });
    });

    after(() => {
        socketManager['io'].close();
        clientSocket.disconnect();
        /*      hostSocket.disconnect(); */
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
            gameServiceStub.restore();
            done();
        });
    });

    it('should allow a player to join a room and receive appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.on('room-joined', (roomId, title, joinedPlayer) => {
            expect(title).to.equal('Test Game');
            expect(joinedPlayer).to.eql(mockPlayer);
        });
    });

    it('should allow a player to leave room and emit appropriate events based on conditions', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('leave-room');

        clientSocket.on('playerlist-change', (players) => {
            expect(players).to.have.property('length', 1);
        });
        clientSocket.on('system-message', (message) => {
            expect(message.text).to.equal(`${mockPlayer.name} a quitté la partie`);
            expect(message.sender).to.equal('Système');
        });
    });

    it('should ban player from room and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('ban-player', 'player1');
        clientSocket.on('banned-from-game', (playerId) => {
            expect(playerId).to.equal('player1');
        });
    });

    it('should toggle the room lock and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('toggle-room-lock');
        clientSocket.on('room-locked', (isLocked) => {
            expect(isLocked).to.equal(true);
        });
    });

    it('should start the game and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('start-game');
        clientSocket.on('game-started', (game) => {
            expect(game).to.eql(mockGame);
        });
    });

    it('should start the next question and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('next-question');
        clientSocket.on('question', (question, index) => {
            expect(question).to.eql(mockGame.questions[0]);
            expect(index).to.equal(0);
        });
    });

    it('should update the points after a QRL question and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('answer-question', '1', 'QRL', [0]);
        clientSocket.on('player-points', (points) => {
            expect(points).to.equal(0);
        });
    });

    it('should pause the timer and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('pause-timer');
        clientSocket.on('timer-paused', (isPaused) => {
            expect(isPaused).to.equal(true);
        });
    });

    it('should enable panic mode and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('enabke-panic-mode');
        clientSocket.on('panic-mode-enabled', (isPanic) => {
            expect(isPanic).to.equal(true);
        });
    });

    it('should receive sent answer and emit appropriate events', () => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        clientSocket.emit('send-answers', '1', 'QRL', [0]);
        clientSocket.on('answer-sent', (playerId, answer) => {
            expect(playerId).to.equal('1');
            expect(answer).to.eql([0]);
        });
    });

    /* it('should allow only host to ban player and emit appropriate events', (done) => {
          hostSocket.emit('join-room', '1', { ...mockPlayer, status: PlayerStatus.Inactive });
        clientSocket.emit('join-room', '1', { ...mockPlayer, status: PlayerStatus.Inactive }); 
        clientSocket.emit('ban-player', 'player1');
        // eslint-disable-next-line
        console.log('asked to ban player');
        clientSocket.on('banned-from-game', (playerId) => {
            // eslint-disable-next-line
            console.log('Banned Player', playerId);
            expect(playerId).to.equal('player1');
            done();
        });
    }); */
});
