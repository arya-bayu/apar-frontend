import { Role } from '@/enums/Role'

export interface IUser {
  id?: string
  name?: string
  phone?: string
  email?: string
  photo?: string
  role?: Role
  permissions?: string[]
  email_verified_at?: string
  must_verify_email?: boolean
  created_at?: string
  updated_at?: string
}
