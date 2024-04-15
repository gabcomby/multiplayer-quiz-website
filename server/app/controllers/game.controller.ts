import { GameService } from '@app/services/game/game.service';
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
                const games = await this.gameService.getGames();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching games' });
            }
        });

        /**
         * @swagger
         * /api/games/{id}:
         *   get:
         *     description: get game by ID
         *     tags: [Games]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: got the game by ID
         *       500:
         *         description: Error fetching game
         */

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const game = await this.gameService.getGame(req.params.id);
                res.json(game);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching game' });
            }
        });

        /**
         * @swagger
         * /api/games:
         *   post:
         *     description: create a new game
         *     tags: [Games]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/definitions/Game'
         *     responses:
         *       200:
         *         description: created a new game
         *       500:
         *         description: Error creating game
         */

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const game = await this.gameService.createGame(req.body);
                res.json(game);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error creating game' });
            }
        });

        /**
         * @swagger
         * /api/games/{id}:
         *   patch:
         *     summary: update a game by ID
         *     tags: [Games]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/definitions/Game'
         *     responses:
         *       200:
         *         description: game by ID updated
         *       500:
         *         description: Error updating game by ID
         */

        this.router.patch('/:id', async (req: Request, res: Response) => {
            try {
                const game = await this.gameService.updateGame(req.body);
                res.json(game);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error updating game' });
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
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const game = await this.gameService.deleteGame(req.params.id);
                res.json(game);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error deleting game' });
            }
        });
    }
}
