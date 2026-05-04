import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { AuthSession, LoginCredentials } from '../../models/auth.model';
import { UserProfile } from '../../models/user.model';

const SESSION_KEY = 'dm-real-estate-auth-session';
const TOKEN_KEY = 'dm-real-estate-token';
const API_BASE_URL = 'http://localhost:8000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);

  constructor(private readonly http: HttpClient) {
    this.sessionSubject.next(this.restoreSession());
  }

  readonly session$ = this.sessionSubject.asObservable();
  readonly user$ = this.session$.pipe(map((session) => session?.user ?? null));
  readonly isAuthenticated$ = this.session$.pipe(map((session) => Boolean(session)));

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      map((session) => {
        this.persistSession(session);
        return session;
      }),
      catchError((error: HttpErrorResponse) => {
        const message =
          typeof error.error === 'object' && error.error?.detail
            ? error.error.detail
            : 'Login failed. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    this.sessionSubject.next(null);
    this.clearStoredSession();
  }

  isAuthenticated(): boolean {
    const session = this.sessionSubject.value;

    if (!session) {
      return false;
    }

    if (session.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }

    return true;
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'admin';
  }

  getCurrentUser(): UserProfile | null {
    return this.sessionSubject.value?.user ?? null;
  }

  getCurrentRole(): UserProfile['role'] | null {
    return this.sessionSubject.value?.user.role ?? null;
  }

  getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return this.sessionSubject.value?.token ?? localStorage.getItem(TOKEN_KEY);
  }

  updateCurrentUser(user: UserProfile): void {
    const session = this.sessionSubject.value;

    if (!session) {
      return;
    }

    this.persistSession({
      ...session,
      user
    });
  }

  private persistSession(session: AuthSession): void {
    this.sessionSubject.next(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, session.token);
  }

  private restoreSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthSession;

      if (!parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
        this.clearStoredSession();
        return null;
      }

      localStorage.setItem(TOKEN_KEY, parsed.token);
      return parsed;
    } catch {
      this.clearStoredSession();
      return null;
    }
  }

  private clearStoredSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

}
