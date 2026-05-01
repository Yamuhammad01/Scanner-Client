export interface VerifyAccessRequest {
  token: string;
  doorId: string;
  deviceId: string;
  timestamp: string;
}

export interface VerifyAccessResponse {
  isGranted: boolean;
  message: string;
  userName: string;
  role: string;
}