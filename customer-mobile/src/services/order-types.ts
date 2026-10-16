export interface OrderView {
  id: string; number: string; status: string; paymentStatus: string; totalAmount: number; createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}
