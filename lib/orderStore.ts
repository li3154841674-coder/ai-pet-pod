interface Order {
  id: string
  status: 'pending' | 'paid' | 'failed'
  createdAt: number
}

const orders = new Map<string, Order>()

export function createOrder(orderId: string): Order {
  const order: Order = {
    id: orderId,
    status: 'pending',
    createdAt: Date.now(),
  }
  orders.set(orderId, order)
  return order
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId)
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
  const order = orders.get(orderId)
  if (order) {
    order.status = status
    orders.set(orderId, order)
    return order
  }
  return undefined
}
