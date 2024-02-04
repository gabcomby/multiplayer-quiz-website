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

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const matches = await this.matchService.getAllMatches();
                res.json(matches);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching all matches from server' });
            }
        });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.getMatch(req.params.id);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching match from server' });
            }
        });

        this.router.get('/:id/players', async (req: Request, res: Response) => {
            try {
                const players = await this.matchService.getAllPlayersFromMatch(req.params.id);
                res.json(players);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching all players from a match' });
            }
        });

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.createMatch(req.body);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error creating the match on the server' });
            }
        });

        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.deleteMatch(req.params.id);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error deleting the match from the server' });
            }
        });

        this.router.patch('/:id/players', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.addPlayer(req.params.id, req.body);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error adding a player to a match' });
            }
        });

        this.router.delete('/:id/players/:playerId', async (req: Request, res: Response) => {
            try {
                const match = await this.matchService.removePlayer(req.params.id, req.params.playerId);
                res.json(match);
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send({ error: 'Error removing a player from a match' });
            }
        });
    }
}
