import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.removeItem('bistroos-session');
    TestBed.configureTestingModule({});
  });

  it('authenticates the demo account and persists only the user profile', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.login('admin@bistroos.com', 'incorrecta')).toBe(false);
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.login('admin@bistroos.com', 'bistro123')).toBe(true);
    expect(auth.currentUser?.email).toBe('admin@bistroos.com');
    expect(localStorage.getItem('bistroos-session')).not.toContain('bistro123');
  });

  it('clears the session when logging out', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('admin@bistroos.com', 'bistro123');

    auth.logout();

    expect(auth.isAuthenticated).toBe(false);
    expect(localStorage.getItem('bistroos-session')).toBeNull();
  });
});
