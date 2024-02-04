import { IQuestion } from '@app/model/game.model';
import questionsModel from '@app/model/questions.model';
import { Service } from 'typedi';

@Service()
export class QuestionsService {
    async getQuestions(): Promise<(typeof questionsModel)[]> {
        return questionsModel.find();
    }

    async getQuestionById(questionId: string): Promise<IQuestion> {
        return questionsModel.findOne({ id: questionId });
    }

    async addQuestionBank(questionData: IQuestion): Promise<IQuestion> {
        return await questionsModel.create(questionData);
    }

    async deleteQuestion(questionId: string): Promise<IQuestion> {
        return await questionsModel.findOneAndDelete({ id: questionId });
    }
}
