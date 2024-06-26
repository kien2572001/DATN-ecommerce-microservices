import {Injectable} from '@nestjs/common';
import {HttpStatus} from "@nestjs/common";

@Injectable()
export class ResponseHandler {
  createSuccessResponse(data: any, message: string = 'Success', statusCode: number = HttpStatus.OK) {
    return {
      statusCode,
      message,
      data,
    };
  }

  createErrorResponse(message: string = 'Error', statusCode: number = 500) {
    return {
      statusCode,
      message,
    };
  }
}