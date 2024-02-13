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

        /**
         * @swagger
         * tags:
         *   name: Questions
         *   description: Endpoints for managing questions
         */

        /**
         * @swagger
         * /api/questions:
         *   get:
         *     description: get all questions
         *     tags: [Questions]
         *     responses:
         *       200:
         *         description: get all questions
         *       500:
         *         description: Error fetching questions
         */
        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const questions = await this.questionsService.getQuestions();
                res.json(questions);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching questions' });
            }
        });

        /**
         * @swagger
         * /api/questions/{id}:
         *   get:
         *     description: Get question by ID
         *     tags: [Questions]
         *     parameters:
         *       - in: path
         *         name: id
         *         description: ID of the question
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: get question by ID
         *       500:
         *         description: Error fetching question
         */
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.getQuestionById(req.params.id);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error fetching question' });
            }
        });

        /**
         * @swagger
         * /api/questions:
         *   post:
         *     description: Create a new question
         *     tags: [Questions]
         *     requestBody:
         *       description: Question Object to create
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/definitions/Question'
         *     responses:
         *       200:
         *         description: Question Object was created
         *       500:
         *         description: Error creating question
         */

        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.addQuestionBank(req.body);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error creating question' });
            }
        });

        /**
         * @swagger
         * /api/questions/{id}:
         *   delete:
         *     description: Delete question by ID
         *     tags: [Questions]
         *     parameters:
         *       - in: path
         *         name: id
         *         description: ID of the question to delete
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Deleted question by ID
         *       500:
         *         description: Error deleting question
         */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.deleteQuestion(req.params.id);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error deleting question' });
            }
        });

        /**
         * @swagger
         * /api/questions/{id}:
         *   patch:
         *     description: Update question by ID
         *     tags: [Questions]
         *     parameters:
         *       - in: path
         *         name: id
         *         description: ID of the question to update
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       description: Question Object updated
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/definitions/Question'
         *     responses:
         *       200:
         *         description: Question by ID has been updated
         *       500:
         *         description: Error updating question
         */
        this.router.patch('/:id', async (req: Request, res: Response) => {
            try {
                const question = await this.questionsService.updateQuestion(req.params.id, req.body);
                res.json(question);
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Error updating question' });
            }
        });
    }
}
