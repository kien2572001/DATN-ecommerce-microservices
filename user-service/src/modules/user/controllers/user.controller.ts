import {Controller, Post, Body, Get, Param} from '@nestjs/common';
import {UserService} from '../user.service';
import {UserCreateByEmailDto} from "../dtos/user.by-email.create.dto";
import {UserLoginDto} from "../dtos/user.login.dto";
import {ResponseHandler} from "../../../utilities/response.handler";
import {HttpStatus} from "@nestjs/common";

@Controller({
  path: '/user',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandler) {
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw this.responseHandler.createErrorResponse('User not found', HttpStatus.NOT_FOUND);
    }
    return this.responseHandler.createSuccessResponse(user, 'User found successfully', HttpStatus.OK);
  }
}