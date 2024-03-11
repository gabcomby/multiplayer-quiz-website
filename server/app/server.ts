import { Application } from '@app/app';
import { Room } from '@app/classes/room';
import type { IChoice } from '@app/model/questions.model';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
// import { MatchLobbyService } from './services/match-lobby.service';

const BASE_TEN = 10;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    rooms = new Map<string, Room>();

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
                if (this.rooms.has(roomId)) {
                    socket.join(roomId);
                    this.rooms.get(roomId).player.set(playerId, socket.id);
                } else {
                    throw new Error('The room you are trying to join does not exist');
                }
            });

            // HAS ROOMS
            socket.on('create-room', (roomId) => {
                if (this.rooms.has(roomId)) {
                    throw new Error('Room already exists');
                }
                this.rooms.set(roomId, new Room(roomId));
                this.rooms.get(roomId).idAdmin = socket.id;
                socket.join(roomId);
            });

            // socket.on('set-game-info', )

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
                    this.rooms.get(roomsArray[1]).firstAnswer = true;
                    this.rooms.get(roomsArray[1]).startCountdownTimer(this.io, roomsArray[1]);
                }
            });

            // TODO: Maybe add an 'answersLocked = 0' line to reset it
            socket.on('stop-timer', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1]) && this.rooms.get(roomsArray[1]).timerId && this.rooms.get(roomsArray[1]).isRunning === true) {
                    clearInterval(this.rooms.get(roomsArray[1]).timerId);
                    this.rooms.get(roomsArray[1]).isRunning = false;
                    this.rooms.get(roomsArray[1]).currentTime = this.rooms.get(roomsArray[1]).duration;
                    this.rooms.get(roomsArray[1]).answersLocked = 0;
                }
            });

            // TODO: Check why it's bugging
            socket.on('answer-submitted', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.rooms.get(roomsArray[1]).answersLocked += 1;
                    if (this.rooms.get(roomsArray[1]).answersLocked === this.rooms.get(roomsArray[1]).player.size) {
                        this.rooms.get(roomsArray[1]).answersLocked = 0;
                        this.io.to(roomsArray[1]).emit('stop-timer');
                    }
                }
            });

            socket.on('playerAnswer', (answer) => {
                const roomId = Array.from(socket.rooms)[1];
                if (this.rooms.has(roomId)) {
                    this.rooms.get(roomId).playersAnswers.push(answer);
                }

                if (this.rooms.get(roomId).playersAnswers.length === this.rooms.get(roomId).player.size) {
                    this.io.to(roomId).emit('sendPlayerAnswers', this.rooms.get(roomId).playersAnswers);
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
                    this.io.to(roomsArray[1]).emit('playerDisconnected', this.rooms.get(roomsArray[1]).player.get(socket.id));
                    this.rooms.get(roomsArray[1]).player.delete(socket.id);
                    if (this.rooms.get(roomsArray[1]).player.size === 0) {
                        this.io.to(roomsArray[1]).emit('lastPlayerDisconnected');
                    }
                }
            });

            socket.on('endGame', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.rooms.get(roomsArray[1]).answersLocked += 1;
                    if (this.rooms.get(roomsArray[1]).answersLocked === this.rooms.get(roomsArray[1]).player.size) {
                        this.rooms.get(roomsArray[1]).answersLocked = 0;
                        this.io.to(roomsArray[1]).emit('endGame');
                    }
                }
            });

            // HAS ROOMS TODO lint
            socket.on('assert-answers', async (choices: IChoice[], answerIdx: number[], playerId: string) => {
                const roomsArray = Array.from(socket.rooms);
                const roomId = roomsArray[1];
                if (this.rooms.has(roomId)) {
                    if (answerIdx.length === 0) {
                        this.io.to(socket.id).emit('answer-verification', false, 1);
                        return;
                    }
                    const totalCorrectChoices = choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                    const isMultipleAnswer = totalCorrectChoices > 1;

                    const selectedCorrectAnswers = answerIdx.reduce((count, index) => (choices[index].isCorrect ? count + 1 : count), 0);

                    let isCorrect = false;
                    if (!isMultipleAnswer) {
                        isCorrect = selectedCorrectAnswers === 1 && choices[answerIdx[0]].isCorrect;
                    } else {
                        const selectedIncorrectAnswers = answerIdx.length - selectedCorrectAnswers;
                        const omittedCorrectAnswers = totalCorrectChoices - selectedCorrectAnswers;
                        isCorrect = selectedIncorrectAnswers === 0 && omittedCorrectAnswers === 0;
                    }

                    if (isCorrect && this.rooms.get(roomId).firstAnswer) {
                        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                        this.io.to(roomId).emit('answer-verification', isCorrect, playerId, 1.2);
                        this.rooms.get(roomId).firstAnswer = false;
                    } else {
                        this.io.to(roomId).emit('answer-verification', isCorrect, playerId, 1);
                    }
                }
            });

            socket.on('chatMessage', ({ message, playerName, isHost }) => {
                const senderName = isHost ? 'Organisateur' : playerName;

                socket.broadcast.emit('chatMessage', {
                    text: message,
                    sender: senderName,
                    timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
            });

            // HAS ROOMS
            socket.on('start', () => {
                const roomsArray = Array.from(socket.rooms);
                if (this.rooms.has(roomsArray[1])) {
                    this.io.to(roomsArray[1]).emit('game-started');
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
