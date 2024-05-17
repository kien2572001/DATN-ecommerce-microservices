import {Classification} from "./classification.schema";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BaseAbstractRepository} from "../../../base/base.abstract.repository";

@Injectable()
export class ClassificationRepository extends BaseAbstractRepository<Classification> {
  constructor(
    @InjectModel(Classification.name) private readonly classificationModel: Model<Classification>
  ) {
    super(classificationModel);
  }
}