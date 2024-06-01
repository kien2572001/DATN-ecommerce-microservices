export enum OrderStatusEnum {
  PLACED = 'placed',
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURN_REQUESTED = 'return_requested',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  ON_HOLD = 'on_hold',
  COD_COLLECTED = 'cod_collected', // Thêm trạng thái "thu hộ thành công"
}
