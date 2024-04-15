import { IQuestion } from '@app/model/game.model';
import questionsModel from '@app/model/questions.model';
import { Service } from 'typedi';
import { MINIMUM_QUESTIONS_FOR_RANDOM_MODE } from '@app/config/server-config';

@Service()
export class QuestionsService {
    async getQuestions(): Promise<(typeof questionsModel)[]> {
        return questionsModel.find();
    }

    async getQuestionById(questionId: string): Promise<IQuestion> {
        return questionsModel.findOne({ id: questionId });
    }

    async addQuestionBank(questionData: IQuestion): Promise<IQuestion> {
        return questionsModel.create(questionData);
    }

    async deleteQuestion(questionId: string): Promise<IQuestion> {
        return questionsModel.findOneAndDelete({ id: questionId });
    }

    async updateQuestion(questionId: string, questionData: IQuestion): Promise<IQuestion> {
        return questionsModel.findOneAndUpdate({ id: questionId }, questionData, { new: true });
    }

    async getFiveRandomQuestions(): Promise<IQuestion[]> {
        return questionsModel.aggregate([{ $match: { type: 'QCM' } }, { $sample: { size: 5 } }]);
    }

    async verifyNumberOfQuestions(): Promise<boolean> {
        return questionsModel.countDocuments({ type: 'QCM' }).then((count) => count >= MINIMUM_QUESTIONS_FOR_RANDOM_MODE);
    }
}
