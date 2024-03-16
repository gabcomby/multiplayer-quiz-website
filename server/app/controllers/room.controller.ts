import { RoomAuthService } from '@app/services/room-auth.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class RoomController {
    router: Router;

    constructor(private readonly roomAuthService: RoomAuthService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/:roomId/auth', async (req: Request, res: Response) => {
            try {
                const isLocked = await this.roomAuthService.verifyPlayerCanJoinRoom(req.params.roomId, req.body);
                res.json(isLocked);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching room lock status' });
            }
        });
    }
}
