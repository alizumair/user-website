export class QuestionsModel {

    questionId: number;
    questionTypeSelection: number;
    optionsList: Array<OptionsModel>;
    question: string;

    constructor(question: any) {
        this.questionId = question['questionId'];
        this.questionTypeSelection = question['questionTypeSelection'];
        this.question = question['question'];
        this.optionsList = [];
    }
}

export class OptionsModel {

    questionOptionId: number;
    optionLabel: string;
    valueChargeType: number;
    flatValue: number;
    percentageValue: number;

    constructor(options: any) {
        this.questionOptionId = options['questionOptionId'];
        this.optionLabel = options['optionLabel'];
        this.valueChargeType = options['valueChargeType'];
        this.flatValue = options['flatValue'];
        this.percentageValue = options['percentageValue'];
    }

}