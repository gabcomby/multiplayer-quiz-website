import { GameService } from '@app/services/game.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameController {
    router: Router;

    constructor(private readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const games = await this.gameService.getGames();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching games' });
            }
        });

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const game = await this.gameService.createGame(req.body);
                res.json(game);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error creating game' });
            }
        });
    }
}
