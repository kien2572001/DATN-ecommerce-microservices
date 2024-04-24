import {Controller, Post, Body, Get, Param} from '@nestjs/common';
import {UserService} from '../user.service';
import {ResponseHandler} from "../../../utilities/response.handler";
import {HttpStatus} from "@nestjs/common";
import {UserCreateByEmailDto} from "../dtos/user.by-email.create.dto";
import {UserLoginDto} from "../dtos/user.login.dto";

@Controller({
  path: '/auth',
})
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandler) {
  }

  @Post('/signup/by-email')
  async signupByEmail(@Body() body: UserCreateByEmailDto) {
    //check if email is already registered
    const existingEmail = await this.userService.checkExistingEmail(body.email);
    if (existingEmail) {
      throw this.responseHandler.createErrorResponse('Email already registered', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.createByEmail(body);
    return this.responseHandler.createSuccessResponse(user, 'User created successfully', HttpStatus.CREATED);
  }

  @Post('/login')
  async login(@Body() body: UserLoginDto) {
    const user = await this.userService.findByEmail(body.email);

    if (!user) {
      throw this.responseHandler.createErrorResponse('Email not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordMatch = await this.userService.checkPassword(body.password, user.password);

    if (!isPasswordMatch) {
      throw this.responseHandler.createErrorResponse('Invalid password', HttpStatus.BAD_REQUEST);
    }

    const userWithoutPassword = {...user};
    delete userWithoutPassword.password;
    const accessToken = await UserService.generateAccessToken({_id: user._id, email: user.email, role: user.role});
    return this.responseHandler.createSuccessResponse({
      user: userWithoutPassword,
      accessToken
    }, 'User logged in successfully');
  }
}