import { Application } from '@app/app';
import { Room } from '@app/classes/room';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
import { IPlayer } from './model/match.model';
import { rooms } from './module';
import { GameService } from './services/game.service';

const BASE_TEN = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    private server: http.Server;
    private io: SocketIoServer;

    constructor(private readonly application: Application) {}

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

        this.io.on('connect', (socket) => {
            const getRoom = () => {
                const roomsArray = Array.from(socket.rooms);
                return rooms.get(roomsArray[1]);
            };

            const setRoom = (room: Room) => {
                const roomsArray = Array.from(socket.rooms);
                rooms.set(roomsArray[1], room);
            };

            const roomExists = (roomId: string) => {
                return rooms.has(roomId);
            };

            socket.on('create-room', async (gameId: string) => {
                const gameService = new GameService();
                const game = await gameService.getGame(gameId);
                const room = new Room(game, false, this.io);
                socket.join(room.roomId);
                setRoom(room);
                getRoom().hostId = socket.id;
                this.io.to(socket.id).emit('room-created', getRoom().roomId, getRoom().game.title);
            });

            socket.on('create-room-test', async (gameId: string, player: IPlayer) => {
                const gameService = new GameService();
                const game = await gameService.getGame(gameId);
                const room = new Room(game, true, this.io);
                socket.join(room.roomId);
                setRoom(room);
                getRoom().hostId = socket.id;
                getRoom().playerList.set(socket.id, player);
                getRoom().playerHasAnswered.set(socket.id, false);
                getRoom().livePlayerAnswers.set(socket.id, []);
                this.io.to(getRoom().roomId).emit('room-test-created', getRoom().game.title, Array.from(getRoom().playerList));
                this.io.to(getRoom().roomId).emit('game-started', getRoom().game.duration, getRoom().game.questions.length);
                getRoom().startQuestion();
            });

            socket.on('join-room', (roomId: string, player: IPlayer) => {
                if (roomExists(roomId)) {
                    socket.join(roomId);
                    // Move this to the room class
                    getRoom().playerList.set(socket.id, player);
                    getRoom().playerHasAnswered.set(socket.id, false);
                    getRoom().livePlayerAnswers.set(socket.id, []);
                    this.io.to(getRoom().roomId).emit('playerlist-change', Array.from(getRoom().playerList));
                    this.io.to(socket.id).emit('playerleftlist-change', Array.from(getRoom().playerLeftList));
                    this.io.to(socket.id).emit('room-joined', getRoom().roomId, getRoom().game.title, player);
                }
            });

            socket.on('leave-room', () => {
                if (roomExists(getRoom().roomId)) {
                    if (getRoom().hostId === socket.id) {
                        this.io.to(getRoom().roomId).emit('lobby-deleted');
                        rooms.delete(getRoom().roomId);
                    } else {
                        // Move this to the room class
                        const player = getRoom().playerList.get(socket.id);
                        getRoom().playerList.delete(socket.id);
                        if (getRoom().playerList.size === 0 && getRoom().gameHasStarted) {
                            this.io.to(getRoom().roomId).emit('lobby-deleted');
                            rooms.delete(getRoom().roomId);
                        } else {
                            if (!getRoom().bannedNames.includes(player.name.toLowerCase())) {
                                getRoom().playerLeftList.push(player);
                                this.io.to(getRoom().roomId).emit('playerleftlist-change', Array.from(getRoom().playerLeftList));
                            }
                            this.io.to(getRoom().roomId).emit('playerlist-change', Array.from(getRoom().playerList));
                        }
                    }
                }
            });

            socket.on('ban-player', (name: string) => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().bannedNames.push(name.toLowerCase());
                    // eslint-disable-next-line -- we do not use key in the find function
                    const playerToBan = [...getRoom().playerList.entries()].find(([key, value]) => value.name === name)?.[0];
                    this.io.to(playerToBan).emit('banned-from-game');
                }
            });

            socket.on('toggle-room-lock', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().roomLocked = !getRoom().roomLocked;
                    this.io.to(getRoom().hostId).emit('room-lock-status', getRoom().roomLocked);
                }
            });

            socket.on('start-game', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().gameHasStarted = true;
                    this.io.to(getRoom().roomId).emit('game-started', getRoom().game.duration, getRoom().game.questions.length);
                    getRoom().startQuestion();
                }
            });

            socket.on('next-question', () => {
                if (roomExists(getRoom().roomId) && socket.id === getRoom().hostId) {
                    getRoom().startQuestion();
                }
            });

            socket.on('update-points-QRL', (points: [IPlayer, number][]) => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().calculatePointsQRL(points);
                }
            });

            socket.on('send-answers', (answer: number[] | string, player: IPlayer) => {
                if (socket.id !== getRoom().hostId) {
                    getRoom().verifyAnswers(socket.id, answer, player);
                }
            });

            socket.on('send-locked-answers', (answerIdx: number[] | string, player: IPlayer) => {
                getRoom().handleEarlyAnswers(socket.id, answerIdx, player);
            });

            socket.on('chat-message', ({ message, playerName, roomId }) => {
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
            // WTF SOCKET ID
            socket.on('send-live-answers', (answerIdx: number[] | string, player: IPlayer) => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().livePlayerAnswers.set(socket.id, answerIdx);
                    this.io.to(getRoom().hostId).emit('livePlayerAnswers', Array.from(getRoom().livePlayerAnswers), player);
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
