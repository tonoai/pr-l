import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { BaseApiService } from '../src/base/base-api.service';

describe('BaseApiService', () => {
  let service: BaseApiService;
  let httpService: HttpService;

  beforeEach(async () => {
    service = new BaseApiService(new HttpService());
    httpService = service['httpService'];
  });

  it('should make a request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'request').mockImplementationOnce(() => of(response as any));

    service.request('path', {});

    const url = service.buildUrl('path');
    expect(httpService.request).toHaveBeenCalledWith({ url });
  });

  it('should make a GET request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(response as any));

    service.get('path');

    const url = service.buildUrl('path');
    expect(httpService.get).toHaveBeenCalledWith(url, undefined);
  });

  it('should make a POST request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response as any));

    service.post('path', 'data');
    const url = service.buildUrl('path');
    expect(httpService.post).toHaveBeenCalledWith(url, 'data', undefined);
  });

  it('should make a HEAD request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'head').mockImplementationOnce(() => of(response as any));

    service.head('path');

    const url = service.buildUrl('path');
    expect(httpService.head).toHaveBeenCalledWith(url, undefined);
  });

  it('should make a PUT request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'put').mockImplementationOnce(() => of(response as any));

    service.put('path', 'data');
    const url = service.buildUrl('path');
    expect(httpService.put).toHaveBeenCalledWith(url, 'data', undefined);
  });
  it('should make a DELETE request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'delete').mockImplementationOnce(() => of(response as any));

    service.delete('path');
    const url = service.buildUrl('path');
    expect(httpService.delete).toHaveBeenCalledWith(url, undefined);
  });

  it('should make a PATCH request', () => {
    const response = { data: 'data' };
    jest.spyOn(httpService, 'patch').mockImplementationOnce(() => of(response as any));

    service.patch('path', 'data');
    const url = service.buildUrl('path');
    expect(httpService.patch).toHaveBeenCalledWith(url, 'data', undefined);
  });
});
