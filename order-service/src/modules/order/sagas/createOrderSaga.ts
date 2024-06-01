import { Injectable } from '@nestjs/common';
import { Step } from 'src/base/step.abstract';
@Injectable()
export class CreateOrderSaga {
  private steps: Step<any, any>[] = [];
  private successfulSteps: Step<any, any>[] = [];

  constructor() {}
}
