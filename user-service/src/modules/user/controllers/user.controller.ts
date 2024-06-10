import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { UserCreateByEmailDto } from '../dtos/user.by-email.create.dto';
import { UserLoginDto } from '../dtos/user.login.dto';
import { ResponseHandler } from '../../../utilities/response.handler';
import { HttpStatus } from '@nestjs/common';

@Controller({
  path: '/user',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get('/list-user-ids')
  async getListUserIds(@Query('role') role: string) {
    let users: any = await this.userService.getListUserIds(role);
    users = users.map((user) => user._id);
    return this.responseHandler.createSuccessResponse(
      users,
      'List of user ids',
      HttpStatus.OK,
    );
  }

  @Post('/by-list-ids')
  async getUserByListIds(
    @Body('ids') ids: string[],
    @Body('includes') includes: string[] = [],
  ) {
    const users = await this.userService.getUserByListIds(ids, includes);
    return this.responseHandler.createSuccessResponse(
      users,
      'List of users',
      HttpStatus.OK,
    );
  }

  @Get('/my-profile')
  async getMyProfile(@Request() req: any) {
    //console.log('req.jwtPayload', req.jwtPayload);
    const user_id = req.jwtPayload._id;
    const user = await this.userService.getUserById(user_id);
    if (!user) {
      throw this.responseHandler.createErrorResponse(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.responseHandler.createSuccessResponse(
      user,
      'User found successfully',
      HttpStatus.OK,
    );
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    console.log('id', id);
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw this.responseHandler.createErrorResponse(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.responseHandler.createSuccessResponse(
      user,
      'User found successfully',
      HttpStatus.OK,
    );
  }
}
