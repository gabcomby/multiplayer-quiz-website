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
        /**
         * @swagger
         * tags:
         *   - name: Authentication
         *     description: Authentication endpoints
         */

        /**
         * @swagger
         * /api/auth:
         *   post:
         *     description: Authenticate user
         *     tags:
         *       - Authentication
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: body
         *         name: password
         *         description: User password
         *         required: true
         *         schema:
         *           type: object
         *           properties:
         *             password:
         *               type: string
         *     responses:
         *       200:
         *         description: Successful operation
         *         schema:
         *           $ref: '#/definitions/Message'
         *       401:
         *         description: Unauthorized
         *         schema:
         *           $ref: '#/definitions/Message'
         *       400:
         *         description: Bad request
         *         schema:
         *           $ref: '#/definitions/Message'
         */
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
    }
}
