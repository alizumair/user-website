export class BotMessage {

  type: string = '';
  message: string = '';
  data: Array<any> = [];
  dataType: number = 0
  
  constructor(type: string, message: string, data?: any, dataType?: number){
    this.type = type;
    this.message = message;
    this.data = data;
    this.dataType = dataType;
  }
}

// dataType: 0 = product, 1 = address