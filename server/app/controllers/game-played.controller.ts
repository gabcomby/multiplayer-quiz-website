import { GamePlayedService } from '@app/services/game-played.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamePlayedController {
    router: Router;

    constructor(private readonly gamePlayedService: GamePlayedService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         * tags:
         *   - name: Games
         *     description: Game endpoints
         */

        /**
         * @swagger
         * /api/games:
         *   get:
         *     description: get all games
         *     tags: [Games]
         *     responses:
         *       200:
         *         description: got all the games
         *       500:
         *         description: Error fetching games
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const games = await this.gamePlayedService.getGamesPlayed();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching games' });
            }
        });

        /**
         * @swagger
         * /api/games/{id}:
         *   delete:
         *     summary: Delete a game by ID
         *     tags: [Games]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: deleted game by ID
         *       500:
         *         description: Error deleting game
         */
        this.router.delete('/deleteAllGamesPlayed', async (req, res) => {
            try {
                const result = await this.gamePlayedService.deletePlayedGames();
                res.status(StatusCodes.OK).send(`Successfully deleted ${result.deletedCount} records.`);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
            }
        });
    }
}
