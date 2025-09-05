import { useWalletClient } from "wagmi";
import { useCallback } from "react";
import axios from "axios";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";

export function usePaymentContext() {
  const { data: walletClient, isError, isLoading } = useWalletClient();

  const createSession = useCallback(async (plan = 'basic') => {
    if (!walletClient || !walletClient.account) throw new Error("please connect your wallet");
    if (isError) throw new Error("wallet not connected");
    if (isLoading) throw new Error("wallet is loading");
    
    const baseClient = axios.create({
      baseURL: "https://payments.vistara.dev",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const apiClient = withPaymentInterceptor(baseClient, walletClient);
    const amount = plan === 'basic' ? "$5" : "$9";
    
    const response = await apiClient.post("/api/payment", { amount });
    const paymentResponse = response.config.headers["X-PAYMENT"];
    
    if (!paymentResponse) throw new Error("payment response is absent");
    
    const decoded = decodeXPaymentResponse(paymentResponse);
    console.log(`Payment successful: ${JSON.stringify(decoded)}`);
    
    return decoded;
  }, [walletClient, isError, isLoading]);

  return { createSession };
}