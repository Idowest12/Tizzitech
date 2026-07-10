/// <reference types="vite/client" />

export class PaystackService {
  static getPublicKey(): string {
    // 1. Try standard literal Vite environment variable first
    // Vite's build process looks for exactly "import.meta.env.VITE_PAYSTACK_PUBLIC_KEY" to replace it with a string literal
    let key: string | undefined = undefined;
    try {
      key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    } catch (e) {
      // Fallback to runtime dynamic check if needed
      key = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY;
    }

    // 2. Try alternative non-prefixed key just in case they set PAYSTACK_PUBLIC_KEY in Vercel
    if (!key) {
      try {
        key = (import.meta as any).env?.PAYSTACK_PUBLIC_KEY;
      } catch (e) {}
    }

    // 3. Check for falsy values, empty strings, or string placeholders like "undefined" / "null"
    if (!key || typeof key !== 'string' || key.trim() === '' || key.trim() === 'undefined' || key.trim() === 'null') {
      console.warn("Paystack Public Key is missing or invalid! Using the default test public key.");
      return 'pk_test_b8e217112ebde369baaa90fbdc9da3a763c87e14';
    }

    let cleanKey = key.trim();

    // 4. Strip accidental wrapping quotes (very common when copying keys into Vercel/environment files)
    if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
      cleanKey = cleanKey.slice(1, -1).trim();
    }
    if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
      cleanKey = cleanKey.slice(1, -1).trim();
    }

    // 5. Check if the user accidentally provided a Secret Key (starting with sk_) instead of a Public Key (starting with pk_)
    if (cleanKey.startsWith('sk_')) {
      console.error("CRITICAL SECURITY WARNING: A Paystack SECRET key (sk_...) was supplied in the frontend! Secret keys must NEVER be exposed to the browser. Falling back to the test public key.");
      return 'pk_test_b8e217112ebde369baaa90fbdc9da3a763c87e14';
    }

    // 6. Check if the key format is correct (must start with pk_)
    if (!cleanKey.startsWith('pk_')) {
      console.error(`Invalid Paystack Public Key format: "${cleanKey}". It must start with "pk_". Falling back to the test public key.`);
      return 'pk_test_b8e217112ebde369baaa90fbdc9da3a763c87e14';
    }

    return cleanKey;
  }

  static async verifyTransaction(reference: string): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch(`/api/payment/verify?reference=${reference}`);
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error: any) {
      console.error('Error verifying transaction:', error);
      return { success: false, message: error.message };
    }
  }
}
