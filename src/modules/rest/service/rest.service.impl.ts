import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { RestService } from './rest.service';

@Injectable()
export class RestServiceImpl implements RestService {
  constructor(
    private readonly httpService: HttpService
  ) { }
  get<T>(url: string, headers) {
    return this.httpService.axiosRef.get<T>(url, headers);
  }
}
