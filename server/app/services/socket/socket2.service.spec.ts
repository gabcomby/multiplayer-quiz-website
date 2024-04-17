import type { Room } from '@app/classes/room';
import { IChoice, IGame, IQuestion } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
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

const mockRoom: Partial<Room> = {
    hostId: '',
    roomId: '1',
    playerList: new Map<string, IPlayer>(),
    game: mockGame as IGame,
};

const rooms: Map<string, Room> = new Map<string, Room>();

describe('Socket Manager Service for Test Room Creation', () => {
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
    });

    after(() => {
        socketManager['io'].close();
        clientSocket.disconnect();
        clientSocketHost.disconnect();
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
});
