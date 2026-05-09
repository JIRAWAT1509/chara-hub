export interface CharaHubRuntimeConfig {
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}

declare global {
  interface Window {
    CHARA_HUB_CONFIG?: CharaHubRuntimeConfig;
  }
}

export function getRuntimeConfig(): CharaHubRuntimeConfig {
  return window.CHARA_HUB_CONFIG ?? {};
}

export function hasSupabaseConfig(): boolean {
  const config = getRuntimeConfig();

  return Boolean(config.supabaseUrl && config.supabasePublishableKey);
}

