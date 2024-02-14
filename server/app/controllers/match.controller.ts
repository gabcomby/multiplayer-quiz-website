import { MatchService } from '@app/services/match.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class MatchController {
    router: Router;

    constructor(private readonly matchService: MatchService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         * tags:
         *   - name: Matches
         *     description: Match endpoints
         */

        /**
         * @swagger
         * /api/matches:
         *   get:
         *     description: Get all matches
         *     tags: [Matches]
         *     responses:
         *       200:
         *         description: A list of matches
         *       404:
         *         description: Error fetching all matches from server
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const matches = await this.matchService.getAllMatches();
                res.json(matches);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching all matches from server' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}:
         *   get:
         *     description: Get a match by ID
         *     tags: [Matches]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Match data
         *       404:
         *         description: Error fetching match from server
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.getMatch(req.params.id);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching match from server' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}/players:
         *   get:
         *     description: Get all players from a match
         *     tags: [Matches]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: A list of players in the match
         *       404:
         *         description: Error fetching all players from a match
         */
        this.router.get('/:id/players', async (req: Request, res: Response) => {
            try {
                const players = await this.matchService.getAllPlayersFromMatch(req.params.id);
                res.json(players);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching all players from a match' });
            }
        });

        /**
         * @swagger
         * /api/matches:
         *   post:
         *     description: Create a new match
         *     tags: [Matches]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/definitions/Match'
         *     responses:
         *       200:
         *         description: Match created
         *       400:
         *         description: Error creating the match on the server
         */
        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.createMatch(req.body);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error creating the match on the server' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}:
         *   delete:
         *     description: Delete a match by ID
         *     tags: [Matches]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Match deleted
         *       400:
         *         description: Error deleting the match from the server
         */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.deleteMatch(req.params.id);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error deleting the match from the server' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}/players:
         *   patch:
         *     description: Add a player to a match
         *     tags: [Matches]
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
         *             type: object
         *             properties:
         *               playerId:
         *                 type: string
         *     responses:
         *       200:
         *         description: Player added to the match
         *       400:
         *         description: Error adding a player to a match
         */
        this.router.patch('/:id/players', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.addPlayer(req.params.id, req.body);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error adding a player to a match' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}/players/{playerId}:
         *   delete:
         *     description: Remove a player from a match
         *     tags: [Matches]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *       - in: path
         *         name: playerId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Player removed from the match
         *       400:
         *         description: Error removing a player from a match
         */
        this.router.delete('/:id/players/:playerId', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.removePlayer(req.params.id, req.params.playerId);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error removing a player from a match' });
            }
        });

        /**
         * @swagger
         * /api/matches/{id}/players/{playerId}:
         *   patch:
         *     description: Update a player's score in a match
         *     tags: [Matches]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *       - in: path
         *         name: playerId
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               score:
         *                 type: integer
         *     responses:
         *       200:
         *         description: Player's score updated
         *       400:
         *         description: Error updating player score
         */
        this.router.patch('/:id/players/:playerId', async (req: Request, res: Response) => {
            try {
                const player = await this.matchService.updatePlayerScore(req.params.id, req.params.playerId, req.body.score);
                res.json(player);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error updating player score' });
            }
        });
    }
}
