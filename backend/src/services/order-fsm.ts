import { OrderStatus } from '../types';
import { BadRequestError } from '../errors/app-error';
const transitions: Record<OrderStatus,OrderStatus[]> = {
  PLACED:['CONFIRMED','CANCELLED'] as OrderStatus[], PENDING:['CONFIRMED','CANCELLED'] as OrderStatus[], CONFIRMED:['PROCESSING','CANCELLED'] as OrderStatus[], PROCESSING:['SHIPPED'] as OrderStatus[], SHIPPED:['OUT_FOR_DELIVERY','DELIVERED'] as OrderStatus[], OUT_FOR_DELIVERY:['DELIVERED'] as OrderStatus[], DELIVERED:['RETURN_REQUESTED'] as OrderStatus[], RETURN_REQUESTED:['RETURNED'] as OrderStatus[], RETURNED:[], REFUNDED:[], CANCELLED:[],
};
export function assertOrderTransition(current: OrderStatus, next: OrderStatus) {
  if (!transitions[current]?.includes(next)) throw new BadRequestError(`Cannot change order from ${current} to ${next}`);
}
