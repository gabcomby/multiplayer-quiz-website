import { Room } from '@app/classes/room';
import { IGame } from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import { rooms } from '@app/module';
import { GameService } from '@app/services/game.service';
import { QuestionsService } from '@app/services/questions.service';
import type * as http from 'http';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';

@Service()
export class SocketManager {
    private io: SocketIoServer;

    init(server: http.Server): void {
        this.io = new SocketIoServer(server, {
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
                const questionService = new QuestionsService();
                let room: Room;
                if (gameId === 'randomModeGame') {
                    const randomQuestions = await questionService.getFiveRandomQuestions();
                    if (randomQuestions.length === 0) {
                        return;
                    }
                    const game = {
                        id: 'randomModeGame',
                        title: 'Mode aléatoire',
                        isVisible: true,
                        description: 'Mode aléatoire',
                        duration: 20,
                        lastModification: new Date(),
                        questions: randomQuestions,
                    } as IGame;
                    room = new Room(game, 2, this.io);
                } else {
                    const game = await gameService.getGame(gameId);
                    room = new Room(game, 0, this.io);
                }
                socket.join(room.roomId);
                setRoom(room);
                room = getRoom();
                room.hostId = socket.id;
                this.io.to(socket.id).emit('room-created', room.roomId, room.game.title, room.gameType);
            });

            socket.on('create-room-test', async (gameId: string, player: IPlayer) => {
                const gameService = new GameService();
                const game = await gameService.getGame(gameId);
                const baseRoom = new Room(game, 1, this.io);
                socket.join(baseRoom.roomId);
                setRoom(baseRoom);
                const room = getRoom();
                room.hostId = socket.id;
                room.playerList.set(socket.id, player);
                room.chatPermission.set(socket.id, true);
                room.playerHasAnswered.set(socket.id, false);
                room.livePlayerAnswers.set(socket.id, []);
                this.io.to(room.roomId).emit('room-test-created', room.game.title, Array.from(room.playerList));
                this.io.to(room.roomId).emit('game-started', room.game.duration, room.game.questions.length);
                room.startQuestion();
            });

            socket.on('join-room', (roomId: string, player: IPlayer) => {
                if (roomExists(roomId)) {
                    socket.join(roomId);
                    // Move this to the room class
                    const room = getRoom();
                    room.playerList.set(socket.id, player);
                    room.playerHasAnswered.set(socket.id, false);
                    room.chatPermission.set(socket.id, true);
                    room.livePlayerAnswers.set(socket.id, []);
                    this.io.to(room.roomId).emit('playerlist-change', Array.from(room.playerList));
                    this.io.to(socket.id).emit('playerleftlist-change', Array.from(room.playerLeftList));
                    this.io.to(socket.id).emit('room-joined', room.roomId, room.game.title, player);
                }
            });

            socket.on('leave-room', () => {
                const room = getRoom();
                if (roomExists(room.roomId)) {
                    if (room.hostId === socket.id) {
                        this.io.to(room.roomId).emit('lobby-deleted');
                        rooms.delete(room.roomId);
                    } else {
                        // Move this to the room class
                        const player = room.playerList.get(socket.id);
                        room.playerList.delete(socket.id);
                        if (room.playerList.size === 0 && room.gameHasStarted) {
                            this.io.to(room.roomId).emit('lobby-deleted');
                            rooms.delete(room.roomId);
                        } else {
                            if (!room.bannedNames.includes(player.name.toLowerCase())) {
                                room.playerLeftList.push(player);
                                this.io.to(room.roomId).emit('playerleftlist-change', Array.from(room.playerLeftList));
                                this.io.to(getRoom().roomId).emit('system-message', {
                                    text: `${player.name} a quitté la partie`,
                                    sender: 'Système',
                                    timestamp: new Date(),
                                    visible: true,
                                });
                            }
                            this.io.to(room.roomId).emit('playerlist-change', Array.from(room.playerList));
                        }
                    }
                }
            });

            socket.on('ban-player', (name: string) => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    room.bannedNames.push(name.toLowerCase());
                    // eslint-disable-next-line -- we do not use key in the find function
                    const playerToBan = [...room.playerList.entries()].find(([key, value]) => value.name === name)?.[0];
                    this.io.to(playerToBan).emit('banned-from-game');
                }
            });

            socket.on('toggle-room-lock', () => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    room.roomLocked = !room.roomLocked;
                    this.io.to(room.hostId).emit('room-lock-status', room.roomLocked);
                }
            });

            socket.on('start-game', () => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    if (room.gameType === 2) {
                        const player: IPlayer = {
                            id: 'organisateur',
                            name: 'Organisateur',
                            score: 0,
                            bonus: 0,
                        } as IPlayer;
                        room.playerList.set(socket.id, player);
                        room.playerHasAnswered.set(socket.id, false);
                        room.livePlayerAnswers.set(socket.id, []);
                        this.io.to(room.roomId).emit('playerlist-change', Array.from(room.playerList));
                        this.io.to(socket.id).emit('playerleftlist-change', Array.from(room.playerLeftList));
                    }
                    room.gameStartDateTime = new Date();
                    room.nbrPlayersAtStart = room.playerList.size;
                    room.gameHasStarted = true;
                    this.io.to(room.roomId).emit('game-started', room.game.duration, room.game.questions.length);
                    room.startQuestion();
                }
            });

            socket.on('next-question', () => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    room.startQuestion();
                }
            });

            socket.on('update-points-QRL', (points: [IPlayer, number][]) => {
                const room = getRoom();
                if (roomExists(room.roomId)) {
                    room.calculatePointsQRL(points);
                }
            });

            socket.on('pause-timer', () => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    room.handleTimerPause();
                }
            });

            socket.on('enable-panic-mode', () => {
                const room = getRoom();
                if (roomExists(room.roomId) && socket.id === room.hostId) {
                    room.handlePanicMode();
                }
            });

            socket.on('send-answers', (answer: number[] | string, player: IPlayer) => {
                const room = getRoom();
                if (socket.id !== room.hostId) {
                    room.verifyAnswers(socket.id, answer, player);
                }
            });

            socket.on('send-locked-answers', (answerIdx: number[] | string, player: IPlayer) => {
                getRoom().handleEarlyAnswers(socket.id, answerIdx, player);
            });

            socket.on('chat-message', ({ message, playerName, roomId }) => {
                const room = getRoom();
                if (room) {
                    if (room.chatPermission.get(socket.id) || room.hostId === socket.id) {
                        socket.to(roomId).emit('chat-message', {
                            text: message,
                            sender: playerName,
                            timestamp: new Date().toISOString(),
                        });
                    } else {
                        // eslint-disable-next-line
                        console.log('User not allowed to send messages');
                    }
                }
            });

            socket.on('disconnect', (reason) => {
                return reason;
            });

            socket.on('send-live-answers', (answerIdx: number[] | string, player: IPlayer, reset: boolean) => {
                const room = getRoom();
                if (roomExists(room.roomId)) {
                    room.livePlayerAnswers.set(socket.id, answerIdx);
                    this.io.to(room.hostId).emit('livePlayerAnswers', Array.from(room.livePlayerAnswers), player);

                    if (!reset && room.gameType !== 1) {
                        room.inputModifications.push({ player: player.id, time: new Date().getTime() });
                    }
                }
            });
            socket.on('update-histogram', () => {
                const room = getRoom();
                if (roomExists(room.roomId)) {
                    room.handleInputModification();
                }
            });
        });
    }
}
