import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ResponseHandler } from '../../utilities/response.handler';

@Controller({
  path: '/address',
})
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Post('/rates')
  async getShippingRates(@Body() addressData) {
    const rates = await this.addressService.getAddressRates(
      addressData.addressTo,
      addressData.shopId,
    );
    return this.responseHandler.createSuccessResponse(
      rates,
      'Shipping rates fetched successfully',
    );
  }

  @Post('/parse')
  async parseAddressToString(@Body() addressData) {
    const address = await this.addressService.parseAddressToString(
      addressData.cityId,
      addressData.districtId,
      addressData.wardId,
    );
    console.log('address', address);
    return this.responseHandler.createSuccessResponse(
      address,
      'Address parsed successfully',
    );
  }

  @Get('/crawl')
  async crawlAddress() {
    const res = await this.addressService.crawAddressData();
    return this.responseHandler.createSuccessResponse(
      res,
      'Address data crawled successfully',
    );
  }

  @Get('/cities')
  async getCities() {
    const cities = await this.addressService.getCities();
    return this.responseHandler.createSuccessResponse(
      cities,
      'Cities fetched successfully',
    );
  }

  @Get('/cities/:cityId/districts')
  async getDistricts(@Param('cityId') cityId: string) {
    const districts = await this.addressService.getDistricts(cityId);
    return this.responseHandler.createSuccessResponse(
      districts,
      'Districts fetched successfully',
    );
  }

  @Get('/districts/:districtId/wards')
  async getWards(@Param('districtId') districtId: string) {
    const wards = await this.addressService.getWards(districtId);
    return this.responseHandler.createSuccessResponse(
      wards,
      'Wards fetched successfully',
    );
  }
}
