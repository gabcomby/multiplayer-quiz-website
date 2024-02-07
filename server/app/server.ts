import { Application } from '@app/app';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';

const ONE_SECOND_IN_MS = 1000;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    room = {
        roomId: 'testroom',
        duration: 0,
        timerId: 0,
        currentTime: 0,
        isRunning: false,
    };
    private server: http.Server;
    private io: SocketIoServer;
    constructor(private readonly application: Application) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }
    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.io = new SocketIoServer(this.server, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            },
        });

        this.io.on('connection', (socket) => {
            socket.on('message', (message) => {
                this.io.emit('message', `Server: ${message}`);
            });

            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('Client disconnected');
            });

            socket.on('set-timer-duration', (duration) => {
                if (!isNaN(duration)) {
                    duration = parseInt(duration, 10);
                    this.room.duration = duration;
                    // eslint-disable-next-line no-console
                    console.log('Set duration of time to', duration);
                    this.io.emit('timer-duration', duration);
                } else {
                    this.io.emit('timer-duration', 'Invalid duration');
                }
            });

            socket.on('start-timer', () => {
                this.room.isRunning = true;
                startCountdownTimer(this.room.duration);
                this.io.emit('timer-update', 'Timer started');
            });

            socket.on('stop-timer', () => {
                clearInterval(this.room.timerId);
                this.room.isRunning = false;
                this.room.currentTime = 0;
                this.io.emit('timer-update', 'Timer stopped');
            });

            const startCountdownTimer = (duration: number): void => {
                if (duration > 0) {
                    const timerId = setInterval(
                        () => {
                            this.io.emit('timer-countdown', duration);
                            duration -= 1;
                            this.room.currentTime = duration;
                        },
                        ONE_SECOND_IN_MS,
                        duration,
                    );
                    this.room.timerId = timerId;
                } else {
                    this.io.emit('timer-update', 'Invalid duration');
                }
            };
        });
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
