export enum OrderStatusEnum {
  PENDING = 'pending', //waiting for save order
  PLACED = 'placed', // saved order to DB successfully
  PAID = 'paid', // paid order successfully with payment method (MOMO)
  CONFIRMED = 'confirmed', // shop confirmed
  SHIPPING = 'shipping', // shop shipping
  DELIVERED = 'delivered', // order delivered
  CANCELLED = 'cancelled', // order cancelled
}
