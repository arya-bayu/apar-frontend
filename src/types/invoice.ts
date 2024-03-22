import { IImage } from './image'
import { IInvoiceItem } from './invoiceItem'
import { ICustomer } from './customer'

export interface IInvoice {
  id: number
  status: number
  invoice_number: string
  date: Date
  customer_id: number
  total: number
  images: IImage[]
  customer: ICustomer
  invoice_items: IInvoiceItem[]
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
}
