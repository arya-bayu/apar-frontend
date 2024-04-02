import { Role } from '@/enums/Role'
import { IImage } from './image'

export interface IUser {
  id?: string
  name?: string
  phone?: string
  email?: string
  photo?: IImage
  role?: Role
  permissions?: string[]
  email_verified_at?: string
  must_verify_email?: boolean
  created_at?: string
  updated_at?: string
}
