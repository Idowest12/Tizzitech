export class PaystackService {
  static getPublicKey(): string {
    const key = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key || key.trim() === '') {
      console.warn("Paystack Public Key is missing! Add VITE_PAYSTACK_PUBLIC_KEY to your environment variables.");
      return '';
    }
    return key;
  }

  static async verifyTransaction(reference: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payment/verify?reference=${reference}`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}
