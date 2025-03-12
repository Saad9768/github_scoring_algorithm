import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { RestService } from './rest.service';
import { AxiosHeaders } from 'axios';

@Injectable()
export class RestServiceImpl implements RestService {
  constructor(
    private readonly httpService: HttpService
  ) { }
  get<T>(url: string, headers) {
    return this.httpService.axiosRef.get<T>(url, headers);
  }
  post<T>(url: string, data: unknown, headers: AxiosHeaders) {

    return this.httpService.axiosRef.post<T>(url, data, { headers }
    );
  }
}
