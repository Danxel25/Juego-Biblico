import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // Fix for: Property 'navigate' does not exist on type 'unknown'.
  // Explicitly typing `router` helps the type checker.
  const router: Router = inject(Router);

  // Convert signal to observable for guard
  return toObservable(authService.isAuthenticated).pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/auth']);
        return false;
      }
    })
  );
};
