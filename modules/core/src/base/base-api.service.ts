import type { HttpService } from '@nestjs/axios';
import type { Observable } from 'rxjs';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export class BaseApiService {
  protected host: string = '';
  protected token: string = ''; //TBD
  protected headers: Record<string, string> = {}; // TBD

  constructor(protected httpService: HttpService) {}

  getHost() {
    return this.host;
  }

  buildUrl(path: string): string {
    return `${this.host}/${path}`;
  }

  request<T = any>(path: string, config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    config.url = this.buildUrl(path);

    return this.httpService.request(config);
  }

  get<T = any>(path: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.get(url, config);
  }

  delete<T = any>(path: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.delete(url, config);
  }

  head<T = any>(path: string, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.head(url, config);
  }

  post<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.post(url, data, config);
  }

  put<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.put(url, data, config);
  }

  patch<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const url = this.buildUrl(path);

    return this.httpService.patch(url, data, config);
  }
}
