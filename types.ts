
export type AuthView = 'login' | 'forgot' | 'help' | 'management';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  designation: string;
  photo: string;
  role: 'admin' | 'user';
  phone?: string;
  milkLiter?: number; // দৈনিক নির্ধারিত দুধ (লিটার/কেজি)
  milkPrice?: number; // প্রতি লিটার/কেজি দুধের দাম
  balance?: number; // বর্তমান ব্যালেন্স (পজিটিভ হলে অ্যাডভান্স/পাওনা, নেগেটিভ হলে ডিউ/দেনা)
}

export type RequestType = 'order' | 'profile_update' | 'milk_update';

export interface SystemRequest {
  id: string;
  type: RequestType;
  userId: string;
  userName: string;
  date: string;
  status: 'pending' | 'completed';
  payload: any;
  oldData?: any;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  qty: number;
  price: number;
  total: number;
  received: number;
  prevBalance: number;
  finalBalance: number;
  type: 'sale' | 'payment';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  item: string;
  date: string;
  status: 'pending' | 'completed';
}
