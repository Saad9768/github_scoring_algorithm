import { AxiosHeaders, AxiosResponse } from "axios";

export interface RestService {
    get<T>(url: string, headers: AxiosHeaders): Promise<AxiosResponse<T>>
    post<T>(url: string, data: unknown, headers: AxiosHeaders): Promise<AxiosResponse<T>>
}