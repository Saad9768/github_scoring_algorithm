import { AxiosResponse } from "axios";

export interface RestService {
    get<T>(url: string, headers: any): Promise<AxiosResponse<T>>
    // post<T>(url: string, headers: any): Promise<AxiosResponse<T>>
}