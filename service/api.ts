import {
  VerifyAccessRequest,
  VerifyAccessResponse,
} from "@/types/access";

const BASE_URL =  process.env.VERIFICATION_URL;

export const verifyAccess = async (
  payload: VerifyAccessRequest
): Promise<VerifyAccessResponse> => {
  const response = await fetch(
    `${BASE_URL}/access-control/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Verification failed");
  }

  return response.json();
};