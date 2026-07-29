import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://iexm7aq7.us-east.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_a11e657f4033796dbf22e2bd308bfd6dbf4a0c66521bc222f183a32291cb079d';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export const getServerClient = () =>
  createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });
