// ─── Shared TypeScript types for TradAdda Backend ───────────────────────────────

export interface CreateUserDto {
  phone: string;
  email: string;
  name: string;
  pancard: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateOrderDto {
  stockSymbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
}

export interface UpdateWalletDto {
  amount: number;
  type: "DEPOSIT" | "WITHDRAW";
}

export interface CreateWatchlistDto {
  name: string;
  stocks: string[];
}

export interface AddToWatchlistDto {
  stockSymbol: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  name: string;
  pancard: string;
  createdAt: Date;
}
