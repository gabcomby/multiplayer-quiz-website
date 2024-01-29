import { QuestionsService } from '@app/services/questions.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class QuestionsController {
    router: Router;

    constructor(private readonly questionsService: QuestionsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const questions = await this.questionsService.getQuestions();
                res.json(questions);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching questions' });
            }
        });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const questions = await this.questionsService.getQuestions();
                res.json(questions);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching question' });
            }
        });
    }
}
