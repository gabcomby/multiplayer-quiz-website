import { Application } from '@app/app';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
import { IPlayer } from './model/match.model';
import { rooms } from './module';
import { RoomService } from './services/room.service';

const BASE_TEN = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    private server: http.Server;
    private io: SocketIoServer;

    constructor(
        private readonly application: Application,
        private roomService: RoomService,
    ) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, BASE_TEN) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }
    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.io = new SocketIoServer(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            },
        });

        // TODO: Move this into the "connect" event
        this.io.on('connection', (socket) => {
            socket.on('message', (message) => {
                this.io.emit('message', `Server: ${message}`);
                console.log(`Server: ${message}`);
            });
        });

        this.io.on('connect', (socket) => {
            this.application.getIdentification().then((pair) => {
                this.io.emit('messageConnect', pair);
                console.log('messageConnect', pair);
            });
            this.application.watchDelete().then((deletedId) => {
                this.io.emit('deleteId', deletedId);
                console.log('deleteId', deletedId);
            });

            const getRoom = () => {
                const roomsArray = Array.from(socket.rooms);
                console.log('roomsArray', roomsArray[1]);
                return rooms.get(roomsArray[1]);
            };

            const roomExists = (roomId: string) => {
                console.log('roomExists', rooms.has(roomId));
                return rooms.has(roomId);
            };

            socket.on('create-room', async (gameId: string) => {
                console.log('create-room', gameId);
                await this.roomService.handleRoomCreation(gameId, this.io, socket);
            });

            socket.on('create-room-test', async (gameId: string, player: IPlayer) => {
                console.log('create-room-test', gameId, player);
                await this.roomService.handleTestRoomCreation(gameId, player, this.io, socket);
                getRoom().startQuestion();
            });

            socket.on('join-room', (roomId: string, player: IPlayer) => {
                console.log('join-room', roomId, player);
                if (roomExists(roomId)) {
                    this.roomService.handleRoomJoin(roomId, player, this.io, socket);
                }
            });

            socket.on('leave-room', () => {
                if (roomExists(getRoom().roomId)) {
                    console.log('leave-room', getRoom().roomId);
                    this.roomService.handleRoomLeave(this.io, socket);
                }
            });

            socket.on('ban-player', (name: string) => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().bannedNames.push(name.toLowerCase());
                    // eslint-disable-next-line
                    const playerToBan = [...getRoom().playerList.entries()].find(([key, value]) => value.name === name)?.[0];
                    console.log('playerToBan', playerToBan);
                    this.io.to(playerToBan).emit('banned-from-game');
                }
            });

            socket.on('toggle-room-lock', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().roomLocked = !getRoom().roomLocked;
                    console.log('roomLocked', getRoom().roomLocked);
                    this.io.to(getRoom().hostId).emit('room-lock-status', getRoom().roomLocked);
                }
            });

            socket.on('start-game', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    console.log('start-game', getRoom().roomId);
                    this.io.to(getRoom().roomId).emit('game-started', getRoom().game.duration, getRoom().game.questions.length);
                    getRoom().startQuestion();
                }
            });

            socket.on('next-question', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    console.log('next-question', getRoom().roomId);
                    getRoom().startQuestion();
                }
            });

            socket.on('send-answers', (answerIdx: number[]) => {
                if (socket.id !== getRoom().hostId) {
                    console.log('send-answers', answerIdx);
                    getRoom().verifyAnswers(socket.id, answerIdx);
                }
            });

            socket.on('send-locked-answers', (answerIdx: number[]) => {
                console.log('send-locked-answers', answerIdx);
                getRoom().handleEarlyAnswers(socket.id, answerIdx);
            });

            socket.on('chat-message', ({ message, playerName, roomId }) => {
                console.log('chat-message', message, playerName, roomId);
                socket.to(roomId).emit('chat-message', {
                    text: message,
                    sender: playerName,
                    timestamp: new Date().toISOString(),
                });
            });

            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('user disconnected');
            });

            socket.on('send-live-answers', (answerIdx: number[]) => {
                if (roomExists(getRoom().roomId)) {
                    console.log('send-live-answers', answerIdx);
                    getRoom().livePlayerAnswers.set(socket.id, answerIdx);
                    this.io.to(getRoom().hostId).emit('livePlayerAnswers', Array.from(getRoom().livePlayerAnswers));
                }
            });
        });

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
    }
    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
