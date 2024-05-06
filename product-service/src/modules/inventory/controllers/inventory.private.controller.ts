import {Controller, Post, Get, Param, Request, Body, HttpStatus, Delete} from "@nestjs/common";


@Controller({
  path: '/private/category',
})
export class CategoryPrivateController {
  constructor() {
  }
}