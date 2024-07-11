import { IImage } from './image'
import { IInvoiceItem } from './invoiceItem'
import { ICustomer } from './customer'
import { IUser } from './user'

export interface IInvoice {
  id: number
  status: number
  invoice_number: string
  date: Date
  customer_id: number
  tax: number
  discount: number
  total: number
  description: string
  images: IImage[]
  customer: ICustomer
  created_by: IUser
  invoice_items: IInvoiceItem[]
  created_at: string
  updated_at: string
}
