import { Amplify } from 'aws-amplify';

let configured = false;

export async function configureAmplify() {
  if (configured) return true;

  try {
    const res = await fetch('/amplify_outputs.json');
    if (!res.ok) throw new Error('Not found');
    const outputs = await res.json();
    if (!outputs?.auth && !outputs?.data) {
      throw new Error('Empty amplify outputs');
    }
    Amplify.configure(outputs);
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
