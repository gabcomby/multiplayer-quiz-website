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
        try {
            const question = await questionsModel.create(questionData);
            return question;
        } catch (error) {
            // console.error('Error adding question to the bank:', error);
            // throw error;
        }
    }

    async deleteQuestion(questionId: string): Promise<IQuestion> {
        return await questionsModel.findOneAndDelete({ id: questionId });
    }

    async updateQuestion(questionId: string, questionData: IQuestion): Promise<IQuestion> {
        const updatedQuestion = await questionsModel.findOneAndUpdate({ id: questionId }, questionData, { new: true });
        return updatedQuestion;
    }
}
