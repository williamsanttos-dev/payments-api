export type TransactionData = {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface PaymentGateway {
  createTransaction(data: TransactionData): Promise<any>
  refund(ExternalTransactionId: string): Promise<any>
}
