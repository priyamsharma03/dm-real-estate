import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { UserProfile } from '../../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private readonly authService: AuthService) {}

  getProfile(): Observable<UserProfile | null> {
    return this.authService.user$;
  }

  updateProfile(update: Partial<Pick<UserProfile, 'name' | 'email' | 'phone'>>): Observable<UserProfile> {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      return throwError(() => new Error('No active session found.'));
    }

    const nextUser: UserProfile = {
      ...currentUser,
      ...update
    };

    this.authService.updateCurrentUser(nextUser);
    return of(nextUser).pipe(delay(450));
  }
}
