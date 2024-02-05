import { AuthService } from '@app/services/auth.service';
import { Message } from '@common/message';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AuthController {
    router: Router;

    constructor(private readonly authService: AuthService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/', (req: Request, res: Response) => {
            const password: string = req.body.password;
            if (typeof password === 'string') {
                const authResult: Message = this.authService.authenticate(password);
                if (authResult.title === 'Authentication Successful') {
                    res.status(StatusCodes.OK).json(authResult);
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json(authResult);
                }
            } else {
                res.status(StatusCodes.BAD_REQUEST).json({ title: 'Invalid Request', body: 'Password is required.' });
            }
        });

        this.router.delete('/api/games/:id', (req, res) => {
            const gameId = req.params.id;
            res.send(gameId);
        });
    }
}
