import { Injectable, computed, signal } from '@angular/core';
import { AuthError, Session, SupabaseClient, User, createClient } from '@supabase/supabase-js';

import { getRuntimeConfig, hasSupabaseConfig } from '../config/app-config';
import { UserProfile } from '../models';

export type AuthMode = 'sign-in' | 'sign-up';

export interface AuthResult {
  ok: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly config = getRuntimeConfig();
  private readonly client: SupabaseClient | null = hasSupabaseConfig()
    ? createClient(this.config.supabaseUrl!, this.config.supabasePublishableKey!)
    : null;

  readonly session = signal<Session | null>(null);
  readonly loading = signal(false);
  readonly ready = signal(false);
  readonly configReady = signal(hasSupabaseConfig());
  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly signedIn = computed(() => Boolean(this.user()));

  get supabaseClient(): SupabaseClient | null {
    return this.client;
  }

  constructor() {
    void this.initialize();
  }

  async initialize(): Promise<void> {
    if (!this.client) {
      this.ready.set(true);
      return;
    }

    const { data } = await this.client.auth.getSession();
    this.session.set(data.session);
    this.ready.set(true);

    if (data.session?.user) {
      await this.ensureUserProfile(data.session.user);
    }

    this.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);

      if (session?.user) {
        void this.ensureUserProfile(session.user);
      }
    });
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!this.client) {
      return this.configMissingResult();
    }

    this.loading.set(true);

    try {
      const { error } = await this.client.auth.signInWithPassword({ email, password });

      if (error) {
        return this.errorResult(error);
      }

      return {
        ok: true,
        message: 'Signed in.'
      };
    } finally {
      this.loading.set(false);
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    if (!this.client) {
      return this.configMissingResult();
    }

    this.loading.set(true);

    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email
          }
        }
      });

      if (error) {
        return this.errorResult(error);
      }

      if (data.user && data.session) {
        await this.ensureUserProfile(data.user, displayName);
      }

      return {
        ok: true,
        message: data.session ? 'Account created.' : 'Check your email to confirm your account.'
      };
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    if (!this.client) {
      return;
    }

    this.loading.set(true);

    try {
      await this.client.auth.signOut();
      this.session.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async ensureUserProfile(user: User, displayName?: string): Promise<void> {
    if (!this.client) {
      return;
    }

    const fallbackName = user.user_metadata?.['display_name'] as string | undefined;

    const profile: Pick<UserProfile, 'id' | 'display_name' | 'default_work_mode'> = {
      id: user.id,
      display_name: displayName || fallbackName || user.email || 'Chara Hub User',
      default_work_mode: 'CHARA'
    };

    await this.client.from('user_profiles').upsert(
      profile,
      {
        onConflict: 'id'
      }
    );
  }

  private configMissingResult(): AuthResult {
    return {
      ok: false,
      message: 'Supabase config is missing.'
    };
  }

  private errorResult(error: AuthError): AuthResult {
    return {
      ok: false,
      message: error.message
    };
  }
}

