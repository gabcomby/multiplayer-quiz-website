import type { Room } from '@app/classes/room';
import { IChoice, IGame, IQuestion } from '@app/model/game.model';
import { IPlayer, PlayerStatus } from '@app/model/match.model';
import { GameService } from '@app/services/game.service';
import { SocketManager } from '@app/services/socket.service';
import { expect } from 'chai';
import { createServer } from 'node:http';
import { type AddressInfo } from 'node:net';
import { stub } from 'sinon';
import { type Socket as ServerSocket } from 'socket.io';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';

const mockGame: Partial<IGame> = {
    id: '1',
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
    roomId: '1',
    playerList: new Map<string, IPlayer>().set('player1', mockPlayer as IPlayer),
    game: mockGame as IGame,
};

describe('Socket Manager service', () => {
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;
    let socketManager: SocketManager;

    beforeEach((done) => {
        const httpServer = createServer();
        socketManager = new SocketManager();
        socketManager.init(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            clientSocket = ioc(`http://localhost:${port}`);
            socketManager['io'].on('connect', (socket) => {
                serverSocket = socket;
                serverSocket.join(mockRoom.roomId);
                mockRoom.playerList.set(socket.id, { ...mockPlayer, id: socket.id } as IPlayer);
                return serverSocket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterEach(() => {
        socketManager['io'].close();
        clientSocket.disconnect();
    });

    it('should create a game room and emit room-created event', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        clientSocket.emit('create-room', '1');
        clientSocket.on('room-created', (roomId, title) => {
            expect(roomId).to.be.a('string');
            expect(title).to.equal('Test Game');
            gameServiceStub.restore();
            done();
        });
    });

    it('should create a room test and emit room-test-created event', (done) => {
        const gameServiceStub = stub(GameService.prototype, 'getGame').resolves(mockGame as unknown as IGame);

        clientSocket.emit('create-room-test', '1');
        clientSocket.on('room-test-created', (title, players) => {
            expect(title).to.equal('Test Game');
            expect(players).to.have.property('length', 1);
            gameServiceStub.restore();
            done();
        });
    });

    it('should allow a player to join a room and receive appropriate events', (done) => {
        clientSocket.emit('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });
        // eslint-disable-next-line
        console.log('join-room', '1', { ...(mockPlayer as IPlayer), status: PlayerStatus.Inactive });

        clientSocket.on('room-joined', (roomId, title, joinedPlayer) => {
            // eslint-disable-next-line
            console.log('room-joined', roomId, title, joinedPlayer);
            expect(title).to.equal('Test Game');
            expect(joinedPlayer).to.eql(mockPlayer);

            done();
        });
    });
});
