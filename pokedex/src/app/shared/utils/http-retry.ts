import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

/**
 * Configuração de retry com backoff exponencial
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  excludeStatusCodes?: number[];
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  excludeStatusCodes: [400, 401, 403, 404],
};

/**
 * Operador de retry com backoff exponencial
 * Aumenta o tempo entre tentativas exponencialmente
 */
export function retryWithBackoff<T>(
  config: Partial<RetryConfig> = {}
): (source: Observable<T>) => Observable<T> {
  const { maxRetries, initialDelay, maxDelay, excludeStatusCodes } = {
    ...defaultConfig,
    ...config,
  };

  return (source: Observable<T>) =>
    source.pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, attempt) => {
            const retryAttempt = attempt + 1;

            // Não retry em status codes específicos
            if (
              error.status &&
              excludeStatusCodes?.includes(error.status)
            ) {
              return throwError(() => error);
            }

            // Máximo de tentativas atingido
            if (retryAttempt > maxRetries) {
              return throwError(() => error);
            }

            // Calcula delay com backoff exponencial
            const delay = Math.min(
              initialDelay * Math.pow(2, retryAttempt - 1),
              maxDelay
            );

            console.log(
              `Retry attempt ${retryAttempt}/${maxRetries} after ${delay}ms`
            );

            return timer(delay);
          })
        )
      )
    );
}
