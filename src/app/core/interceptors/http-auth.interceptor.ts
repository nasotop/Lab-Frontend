import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../http/token.service';
import { tap } from 'rxjs/operators';

export const httpAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.get();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    tap({
      next: (event: any) => {
        if (event?.body?.success === false) {
          console.error(
            'Error lógico (ResultDto.fail):',
            event.body.errorMessage
          );
        }
      },
      error: (err) => {
        console.error('HTTP Error:', err);
      },
    })
  );
};
