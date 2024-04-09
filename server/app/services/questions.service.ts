import { IQuestion } from '@app/model/game.model';
import questionsModel from '@app/model/questions.model';
import { Service } from 'typedi';

const MINIMUM_QUESTIONS_FOR_RANDOM_MODE = 5;

@Service()
export class QuestionsService {
    async getQuestions(): Promise<(typeof questionsModel)[]> {
        return questionsModel.find();
    }

    async getQuestionById(questionId: string): Promise<IQuestion> {
        return questionsModel.findOne({ id: questionId });
    }

    async addQuestionBank(questionData: IQuestion): Promise<IQuestion> {
        const question = await questionsModel.create(questionData);
        return question;
    }

    async deleteQuestion(questionId: string): Promise<IQuestion> {
        return await questionsModel.findOneAndDelete({ id: questionId });
    }

    async updateQuestion(questionId: string, questionData: IQuestion): Promise<IQuestion> {
        const updatedQuestion = await questionsModel.findOneAndUpdate({ id: questionId }, questionData, { new: true });
        return updatedQuestion;
    }

    async getFiveRandomQuestions(): Promise<IQuestion[]> {
        return await questionsModel.aggregate([{ $match: { type: 'QCM' } }, { $sample: { size: 5 } }]);
    }

    async verifyNumberOfQuestions(): Promise<boolean> {
        return (await questionsModel.countDocuments({ type: 'QCM' })) >= MINIMUM_QUESTIONS_FOR_RANDOM_MODE;
    }
}
