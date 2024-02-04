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
                const question = await this.questionsService.getQuestionById(req.params.id);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching question' });
            }
        });

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.addQuestionBank(req.body);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error creating question' });
            }
        });

        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.deleteQuestion(req.params.id);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error deleting question' });
            }
        });
    }
}
