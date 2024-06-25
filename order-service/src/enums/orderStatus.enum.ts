export enum OrderStatusEnum {
  PENDING = 'pending', //waiting for save order
  PLACED = 'placed', // saved order to DB successfully
  PAYMENT_PENDING = 'payment_pending', // waiting for payment
  PAID = 'paid', // paid order successfully with payment method (MOMO,STRIPE)
  CONFIRMED = 'confirmed', // shop confirmed
  SHIPPING_CREATED = 'shipping_created', // shipping created
  DELIVERED = 'delivered', // order delivered
  CANCELLED = 'cancelled', // order cancelled
  DONE = 'done', // order done
}
