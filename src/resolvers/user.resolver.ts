import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { filter, first, map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const userResolver: ResolveFn<User | null> = (route, state) => {
  const authService = inject(AuthService);

  // Wait for auth processing to finish (either loaded or errored out)
  return toObservable(authService.authLoadingState).pipe(
    filter((state) => state === 'idle' || state === 'error'),
    first(),
    // Then get the current value of the user signal
    map(() => authService.currentUser())
  );
};
