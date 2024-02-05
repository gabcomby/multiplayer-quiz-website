import { HttpException } from '@app/classes/http.exception';
import { DateController } from '@app/controllers/date.controller';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import * as socketIo from 'socket.io';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { AuthController } from './controllers/auth.controller';
import { GameController } from './controllers/game.controller';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    constructor(
        private readonly dateController: DateController,
        private readonly gameController: GameController,
        private readonly authController: AuthController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();
        this.connectToDatabase();
        this.bindRoutes();
    }

    connectToDatabase(): void {
        const mongoDBUri = 'mongodb+srv://goffipro:goffipro@cluster0.rh9tycx.mongodb.net/?retryWrites=true&w=majority';
        mongoose.connect(mongoDBUri);
        const server = http.createServer(this.app);
        const io = new socketIo.Server(server);
        const db = mongoose.connection.useDb('test');
        const gameSchema = new mongoose.Schema({}, { strict: false });
        const game = db.model('Game', gameSchema, 'games');
        const changeStream = game.watch();
        changeStream.on('change', (data) => {
            if (data.operationType === 'delete') {
                console.log('delete');
                const deleteId = data.documentKey.id;
                io.emit('deleteId', deleteId);
                console.log('deletedone');
            }
        });
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/date', this.dateController.router);
        this.app.use('/api/games', this.gameController.router);
        this.app.use('/api/authenticate', this.authController.router);
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });

        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces  leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
