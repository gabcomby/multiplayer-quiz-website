import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class MatchLobbyController {
    router: Router;

    constructor(private readonly matchLobbyService: MatchLobbyService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const lobbies = await this.matchLobbyService.getAllLobbies();
                res.json(lobbies);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching all lobbies from server' });
            }
        });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.getLobby(req.params.id);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching lobby from server' });
            }
        });

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.createLobby(req.body);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error creating lobby' });
            }
        });

        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.deleteLobby(req.params.id);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error deleting lobby' });
            }
        });

        this.router.patch('/:id/players', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.addPlayer(req.params.id, req.body);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error adding player to lobby' });
            }
        });

        this.router.delete('/:id/players/:name', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.removePlayer(req.params.id, req.params.name);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error removing player from lobby' });
            }
        });

        this.router.get('/:id/ban', async (req: Request, res: Response) => {
            try {
                const banned = await this.matchLobbyService.getBannedPlayers(req.params.id);
                res.json(banned);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error fetching banned players from lobby' });
            }
        });

        this.router.patch('/:id/ban/:name', async (req: Request, res: Response) => {
            try {
                const lobby = await this.matchLobbyService.banPlayer(req.params.id, req.params.name);
                res.json(lobby);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send({ error: 'Error banning player from lobby' });
            }
        });
    }
}
