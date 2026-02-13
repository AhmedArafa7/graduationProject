import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      let message = 'حدث خطأ غير متوقع';

      if (error.status === 0) {
        message = 'تعذر الاتصال بالخادم. يرجى التحقق من الإنترنت.';
      } else if (error.status === 401) {
        message = 'جلسة العمل انتهت. يرجى تسجيل الدخول مجدداً.';
      } else if (error.status === 403) {
        message = 'ليس لديك صلاحية للقيام بهذا الإجراء.';
      } else if (error.status >= 500) {
        message = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
      }

      // Only show toast for non-GET requests or critical errors to avoid spamming
      if (req.method !== 'GET' || error.status === 0 || error.status >= 500) {
         toast.show(message, 'error');
      }
      
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
