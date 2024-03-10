import { Application } from '@app/app';
import { Room } from '@app/classes/room';
import type { IChoice } from '@app/model/questions.model';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';

// const ONE_SECOND_IN_MS = 1000;
const BASE_TEN = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    rooms = new Map<string, Room>();
    room = {
        duration: 0,
        timerId: 0,
        currentTime: 0,
        isRunning: false,
        idAdmin: '',
        player: new Map(),
        answersLocked: 0,
    };
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

        // TODO: Move this into the "connect" event
        this.io.on('connection', (socket) => {
            socket.on('message', (message) => {
                this.io.emit('message', `Server: ${message}`);
            });
        });

        this.io.on('connect', (socket) => {
            this.application.getIdentification().then((pair) => {
                this.io.emit('messageConnect', pair);
            });
            this.application.watchDelete().then((deletedId) => {
                this.io.emit('deleteId', deletedId);
            });

            // HAS ROOMS
            socket.on('join-room', (roomId, playerId) => {
                socket.join(roomId);
                this.rooms.get(roomId).player.set(playerId, socket.id);
            });
            // HAS ROOMS
            socket.on('create-room', (roomId) => {
                if (this.rooms.has(roomId)) {
                    throw new Error('Room already exists');
                }
                this.rooms.set(roomId, new Room(roomId));
                this.rooms.get(roomId).idAdmin = socket.id;
                socket.join(roomId);
                const roomsArray = Array.from(socket.rooms);
                // eslint-disable-next-line no-console
                console.log('Room id is', roomsArray[1]);
            });

            // HAS ROOMS
            socket.on('set-timer-duration', (duration) => {
                const roomsArray = Array.from(socket.rooms);
                if (parseInt(duration, 10) > 0) {
                    if (this.rooms.has(roomsArray[1]) === true) {
                        this.rooms.get(roomsArray[1]).duration = parseInt(duration, 10);
                    }
                } else {
                    throw new Error('Invalid duration');
                }
            });

            // HAS ROOMS
            socket.on('start-timer', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1]) && this.rooms.get(roomsArray[1]).isRunning === false) {
                    this.rooms.get(roomsArray[1]).isRunning = true;
                    this.rooms.get(roomsArray[1]).startCountdownTimer(this.io, roomsArray[1]);
                }
            });

            // HAS ROOMS
            socket.on('stop-timer', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1]) && this.rooms.get(roomsArray[1]).timerId && this.rooms.get(roomsArray[1]).isRunning === true) {
                    clearInterval(this.rooms.get(roomsArray[1]).timerId);
                    this.rooms.get(roomsArray[1]).isRunning = false;
                    this.rooms.get(roomsArray[1]).currentTime = this.rooms.get(roomsArray[1]).duration;
                }
            });

            // HAS ROOMS
            socket.on('answerSubmitted', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.rooms.get(roomsArray[1]).answersLocked += 1;
                    if (this.rooms.get(roomsArray[1]).answersLocked === this.rooms.get(roomsArray[1]).player.size) {
                        this.rooms.get(roomsArray[1]).answersLocked = 0;
                        this.io.to(roomsArray[1]).emit('stop-timer');
                    }
                }
            });

            // HAS ROOMS
            socket.on('new-player', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.io.to(roomsArray[1]).emit('new-player-connected');
                }
            });

            socket.on('admin-disconnect', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.io.to(roomsArray[1]).emit('adminDisconnected');
                    this.rooms.delete(roomsArray[1]);
                }
            });

            socket.on('player-disconnect', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.io.to(roomsArray[1]).emit('playerDisconnected');
                }
            });

            // HAS ROOMS
            socket.on('assert-answers', (choices: IChoice[], answerIdx: number[]) => {
                const roomsArray = Array.from(socket.rooms);
                const roomId = roomsArray[1];
                if (this.rooms.has(roomId)) {
                    if (answerIdx.length === 0) {
                        this.io.to(roomId).emit('answer-verification', false);
                        return;
                    }
                    const totalCorrectChoices = choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                    const isMultipleAnswer = totalCorrectChoices > 1;

                    const selectedCorrectAnswers = answerIdx.reduce((count, index) => (choices[index].isCorrect ? count + 1 : count), 0);

                    if (!isMultipleAnswer) {
                        this.io.to(roomId).emit('answer-verification', selectedCorrectAnswers === 1 && choices[answerIdx[0]].isCorrect);
                    } else {
                        const selectedIncorrectAnswers = answerIdx.length - selectedCorrectAnswers;
                        const omittedCorrectAnswers = totalCorrectChoices - selectedCorrectAnswers;
                        this.io.to(roomId).emit('answer-verification', selectedIncorrectAnswers === 0 && omittedCorrectAnswers === 0);
                    }
                }
            });

            // HAS ROOMS
            socket.on('start', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.io.to(roomsArray[1]).emit('game-timer');
                }
            });
            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('user disconnected');
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
