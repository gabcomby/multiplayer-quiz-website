import { Application } from '@app/app';
import { Room } from '@app/classes/room';
import type { IChoice } from '@app/model/questions.model';
import { GameService } from '@app/services/game.service';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
import { IQuestion } from './model/game.model';
import { IPlayer } from './model/match.model';
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
// const rooms = require('@app/module');
import { rooms } from './module';

const BASE_TEN = 10;
const FIRST_ANSWER_MULTIPLIER = 1.2;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    // rooms = new Map<string, Room>();

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

            // ==================== FUNCTIONS USED AFTER REFACTOR ====================
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
                const room = new Room(game);
                socket.join(room.roomId);
                setRoom(room);
                getRoom().hostId = socket.id;
                this.io.to(socket.id).emit('room-created', getRoom().roomId);
            });

            socket.on('join-room', (roomId: string, player: IPlayer) => {
                // TODO: Authentifier le nom de l'utilisateur
                if (roomExists(roomId)) {
                    socket.join(roomId);
                    getRoom().playerList.set(socket.id, player);
                    this.io.to(getRoom().roomId).emit('playerlist-change', Array.from(getRoom().playerList));
                    this.io.to(socket.id).emit('room-joined', getRoom().roomId);
                    // eslint-disable-next-line no-console
                    console.log('Joined', roomId, 'room is', rooms.get(roomId));
                } else {
                    throw new Error('The room you are trying to join does not exist');
                }
            });

            socket.on('leave-room', () => {
                if (roomExists(getRoom().roomId)) {
                    if (getRoom().hostId === socket.id) {
                        this.io.to(getRoom().roomId).emit('lobby-deleted');
                        rooms.delete(getRoom().roomId);
                    } else {
                        getRoom().playerList.delete(socket.id);
                        if (getRoom().playerList.size === 0) {
                            this.io.to(getRoom().roomId).emit('lobby-deleted');
                        } else {
                            this.io.to(getRoom().roomId).emit('playerlist-change', Array.from(getRoom().playerList));
                        }
                    }
                }
            });

            socket.on('ban-player', (name: string) => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().bannedNames.push(name);
                    // eslint-disable-next-line
                    const playerToBan = [...getRoom().playerList.entries()].find(([key, value]) => value.name === name)?.[0];
                    this.io.to(playerToBan).emit('banned-from-game');
                } else {
                    throw new Error('Error trying to ban a player from a room that does not exist');
                }
            });

            // ==================== FUNCTIONS USED AFTER REFACTOR ====================

            socket.on('toggle-room-lock', () => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().roomLocked = !getRoom().roomLocked;
                } else {
                    throw new Error('Error trying to toggle the lock of a room that does not exist');
                }
            });

            socket.on('verify-room-lock', (roomId: string) => {
                if (roomExists(roomId)) {
                    this.io.to(socket.id).emit('room-lock-status', rooms.get(roomId).roomLocked);
                } else {
                    throw new Error('Error trying to get the lock status of a room that does not exist');
                }
            });

            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('user disconnected');
            });

            // FONCTIONS DE GESTION DU TIMER

            socket.on('set-timer-duration', (duration) => {
                if (roomExists(getRoom().roomId)) {
                    if (parseInt(duration, 10) > 0) {
                        getRoom().duration = parseInt(duration, 10);
                    } else {
                        throw new Error('Invalid duration');
                    }
                } else {
                    throw new Error('The room you are trying to set the timer for does not exist');
                }
            });

            socket.on('start-timer', () => {
                if (roomExists(getRoom().roomId)) {
                    if (!getRoom().isRunning && getRoom().hostId === socket.id) {
                        getRoom().isRunning = true;
                        getRoom().firstAnswer = true;
                        getRoom().startCountdownTimer(this.io, getRoom().roomId);
                    }
                } else {
                    throw new Error('Error trying to start the timer of a room that does not exist');
                }
            });

            socket.on('stop-timer', () => {
                if (roomExists(getRoom().roomId)) {
                    if (getRoom().isRunning && getRoom().hostId === socket.id) {
                        getRoom().resetTimerCountdown();
                    }
                } else {
                    throw new Error('Error trying to stop the timer of a room that does not exist');
                }
            });

            // FONCTION DE GESTION DES RÉPONSES
            socket.on('answer-submitted', () => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().answersLocked += 1;
                    if (getRoom().answersLocked === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('stop-timer');
                        getRoom().resetTimerCountdown();
                    }
                } else {
                    throw new Error('Error trying to submit the answer');
                }
            });

            socket.on('sendClickedAnswer', (answerIdx: number[]) => {
                if (roomExists(getRoom().roomId)) {
                    const playerId = getRoom().player.get(socket.id);
                    getRoom().livePlayerAnswers.set(playerId, answerIdx);
                    // jusqu'ici la vie est belle
                    this.io.to(getRoom().hostId).emit('livePlayerAnswers', Array.from(getRoom().livePlayerAnswers));
                }
            });

            socket.on('playerAnswer', (answer) => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().playersAnswers.push(answer);
                    if (getRoom().playersAnswers.length === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('sendPlayerAnswers', getRoom().playersAnswers);
                    }
                } else {
                    throw new Error('Error trying to submit the answer');
                }
            });

            socket.on('endGame', () => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().answersLocked += 1;
                    if (getRoom().answersLocked === getRoom().player.size) {
                        getRoom().answersLocked = 0;
                        this.io.to(getRoom().roomId).emit('endGame');
                    }
                } else {
                    throw new Error('Error trying to end the game of a room that does not exist');
                }
            });

            socket.on('assert-answers', async (question: IQuestion, answerIdx: number[]) => {
                const playerId = getRoom().player.get(socket.id);
                const choices: IChoice[] = question.choices;
                rooms.get(getRoom().roomId).assertedAnswers += 1;
                if (roomExists(getRoom().roomId)) {
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

                    if (isCorrect && getRoom().firstAnswer) {
                        getRoom().firstAnswer = false;
                        const currentScore = getRoom().score.get(playerId);
                        getRoom().score.set(playerId, FIRST_ANSWER_MULTIPLIER * question.points + currentScore);
                        this.io.to(getRoom().roomId).emit('got-bonus', playerId);
                    } else if (isCorrect) {
                        const currentScore = getRoom().score.get(playerId);
                        getRoom().score.set(playerId, question.points + currentScore);
                    }

                    if (getRoom().assertedAnswers === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('answer-verification', Array.from(getRoom().score));
                        getRoom().assertedAnswers = 0;
                    }
                } else {
                    throw new Error('Error trying to calculate the score of a room that does not exist');
                }
            });

            socket.on('chat-message', ({ message, playerName, roomId }) => {
                socket.to(roomId).emit('chat-message', {
                    text: message,
                    sender: playerName,
                    timestamp: new Date().toISOString(),
                });
            });

            socket.on('goToResult', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('resultView');
                } else {
                    throw new Error('Error trying to go to the result view of a room that does not exist');
                }
            });

            socket.on('goNextQuestion', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('handleNextQuestion');
                } else {
                    throw new Error('Error trying to go to the next question of a room that does not exist');
                }
            });

            socket.on('start', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('game-started');
                } else {
                    throw new Error('Error trying to start the game of a room that does not exist');
                }
            });

            socket.on('banFromGame', (idPlayer) => {
                const roomsArray = Array.from(socket.rooms);
                let socketToBeBanned: string;
                if (rooms.has(roomsArray[1])) {
                    const players = rooms.get(roomsArray[1]).player;
                    for (const [key, value] of players.entries()) {
                        if (value === idPlayer) socketToBeBanned = key;
                    }
                    if (socketToBeBanned) {
                        this.io.to(socketToBeBanned).emit('bannedFromHost');
                    }
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
