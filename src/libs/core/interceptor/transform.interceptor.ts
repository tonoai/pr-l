import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerResponse } from 'http';
import { instanceToPlain } from 'class-transformer';
import { SkipTransformSymbol } from './decorator/skip-transform-interceptor.decorator';

export interface Response<T> {
  statusCode: number;
  message?: any;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  static formatResponse(response) {
    return {
      statusCode: response?.statusCode ?? 200,
      message: response?.message,
      data: response?.statusCode ? response.data : response?.data ?? response,
    };
  }

  static instanceToPlain(response) {
    try {
      if (response?.data && !(response.data instanceof ServerResponse)) {
        response.data = instanceToPlain(response.data);

        return response;
      }

      return response;
    } catch (e) {
      return response;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const isIgnored = context.getHandler()[SkipTransformSymbol];
    if (isIgnored) {
      return next.handle();
    }

    return next.handle().pipe(
      map(response => TransformInterceptor.formatResponse(response)),
      map(response => TransformInterceptor.instanceToPlain(response)),
    );
  }
}
