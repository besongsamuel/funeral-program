import { Amplify } from 'aws-amplify';

let configured = false;
let outputs: {
  custom?: { assistant_url?: string };
} | null = null;

export async function configureAmplify() {
  if (configured) return true;

  try {
    const res = await fetch('/amplify_outputs.json');
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    if (!json?.auth && !json?.data) {
      throw new Error('Empty amplify outputs');
    }
    outputs = json;
    Amplify.configure(json);
    configured = true;
    return true;
  } catch {
    console.info('amplify_outputs.json not found — using demo data mode');
    return false;
  }
}

export function isAmplifyConfigured() {
  return configured;
}

export function getAssistantUrl() {
  return import.meta.env.VITE_ASSISTANT_URL || outputs?.custom?.assistant_url;
}
