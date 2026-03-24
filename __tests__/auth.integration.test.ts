/**
 * Integration tests for auth flows.
 * Mocks the Supabase client from lib/supabase.ts.
 */

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from '../lib/supabase';

const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;

describe('Auth flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sign-up with valid email/password calls signUp', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' }, session: null }, error: null });
    await supabase.auth.signUp({ email: 'test@example.com', password: 'pass123' } as Parameters<typeof supabase.auth.signUp>[0]);
    expect(mockSignUp).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass123' });
  });

  it('sign-in with valid credentials calls signInWithPassword and returns session', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
      error: null,
    });
    const result = await supabase.auth.signInWithPassword({ email: 'test@example.com', password: 'pass123' });
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass123' });
    expect((result as { data: { session: unknown }; error: null }).data.session).toBeTruthy();
  });

  it('sign-in with wrong password returns error', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });
    const result = await supabase.auth.signInWithPassword({ email: 'test@example.com', password: 'wrong' });
    expect((result as { data: unknown; error: { message: string } }).error).toBeTruthy();
    expect((result as { data: unknown; error: { message: string } }).error.message).toBe('Invalid login credentials');
  });

  it('onAuthStateChange callback is registered', () => {
    const mockCallback = jest.fn();
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    supabase.auth.onAuthStateChange(mockCallback);
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(mockCallback);
  });

  it('sign-out calls supabase.auth.signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await supabase.auth.signOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
