import { Injectable } from '@angular/core';

export interface AuthUser {
  email: string;
  name: string;
}

const SESSION_KEY = 'bistroos-session';
const DEMO_EMAIL = 'admin@bistroos.com';
const DEMO_PASSWORD = 'bistro123';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: AuthUser | null = this.readSession();

  get currentUser(): AuthUser | null {
    return this.user;
  }

  get isAuthenticated(): boolean {
    return this.user !== null;
  }

  login(email: string, password: string): boolean {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return false;
    }

    this.user = { email: DEMO_EMAIL, name: 'Administrador' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.user));
    return true;
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem(SESSION_KEY);
  }

  private readSession(): AuthUser | null {
    const storedSession = localStorage.getItem(SESSION_KEY);

    if (!storedSession) {
      return null;
    }

    const session: unknown = JSON.parse(storedSession);

    if (
      typeof session === 'object' &&
      session !== null &&
      'email' in session &&
      typeof session.email === 'string' &&
      'name' in session &&
      typeof session.name === 'string'
    ) {
      return { email: session.email, name: session.name };
    }

    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
