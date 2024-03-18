import { Room } from '@app/classes/room';
import { IPlayer } from '@app/model/match.model';
import { rooms } from '@app/module';
import { Socket, Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
import { GameService } from './game.service';

@Service()
export class RoomService {
    constructor(private gameService: GameService) {}

    async handleRoomCreation(gameId: string, io: SocketIoServer, socket: Socket): Promise<void> {
        const game = await this.gameService.getGame(gameId);
        const room = new Room(game, false, io);
        rooms.set(room.roomId, room);
        socket.join(room.roomId);
        rooms.get(room.roomId).hostId = socket.id;
        io.to(socket.id).emit('room-created', rooms.get(room.roomId).roomId, rooms.get(room.roomId).game.title);
    }

    // eslint-disable-next-line max-params -- This is a socket.io event handler, we need many parameters
    async handleTestRoomCreation(gameId: string, player: IPlayer, io: SocketIoServer, socket: Socket): Promise<void> {
        const game = await this.gameService.getGame(gameId);
        const room = new Room(game, true, io);
        rooms.set(room.roomId, room);
        socket.join(room.roomId);
        rooms.get(room.roomId).hostId = socket.id;
        rooms.get(room.roomId).playerList.set(socket.id, player);
        rooms.get(room.roomId).playerHasAnswered.set(socket.id, false);
        rooms.get(room.roomId).livePlayerAnswers.set(socket.id, []);
        io.to(room.roomId).emit('room-test-created', rooms.get(room.roomId).game.title, Array.from(rooms.get(room.roomId).playerList));
        io.to(room.roomId).emit('game-started', rooms.get(room.roomId).game.duration, rooms.get(room.roomId).game.questions.length);
    }

    // eslint-disable-next-line max-params -- This is a socket.io event handler, we need many parameters
    handleRoomJoin(roomId: string, player: IPlayer, io: SocketIoServer, socket: Socket): void {
        socket.join(roomId);
        rooms.get(roomId).playerList.set(socket.id, player);
        rooms.get(roomId).playerHasAnswered.set(socket.id, false);
        rooms.get(roomId).livePlayerAnswers.set(socket.id, []);
        io.to(roomId).emit('playerlist-change', Array.from(rooms.get(roomId).playerList));
        io.to(socket.id).emit('playerleftlist-change', Array.from(rooms.get(roomId).playerLeftList));
        io.to(socket.id).emit('room-joined', rooms.get(roomId).roomId, rooms.get(roomId).game.title);
    }

    handleRoomLeave(io: SocketIoServer, socket: Socket): void {
        const roomsArray = Array.from(socket.rooms);
        const room = rooms.get(roomsArray[1]);
        const roomId = room.roomId;
        if (room.hostId === socket.id) {
            io.to(roomId).emit('lobby-deleted');
            rooms.delete(room.roomId);
        } else {
            const player = room.playerList.get(socket.id);
            rooms.get(roomId).playerList.delete(socket.id);
            if (rooms.get(roomId).playerList.size === 0) {
                io.to(roomId).emit('lobby-deleted');
            } else {
                if (!rooms.get(roomId).bannedNames.includes(player.name.toLowerCase())) {
                    rooms.get(roomId).playerLeftList.push(player);
                    io.to(roomId).emit('playerleftlist-change', Array.from(rooms.get(roomId).playerLeftList));
                }
                io.to(roomId).emit('playerlist-change', Array.from(rooms.get(roomId).playerList));
            }
        }
    }
}
