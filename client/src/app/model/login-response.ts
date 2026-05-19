export interface LoginResponse {
  userId: number;
  token: string;
  username: string;
  email: string;
  role: string;
  isSubscribed: boolean;
}
