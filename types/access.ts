export interface VerifyAccessRequest {
  uid: string;
  readerId: string;
  door: string;
}

export interface VerifyAccessResponse {
  isGranted: boolean;
  message: string;
  userName: string;
  role: string;
}