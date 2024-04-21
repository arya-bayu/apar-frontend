import { FormEventHandler, useRef, useState, useEffect } from 'react'
import axios, { csrf } from '@/lib/axios'
import Modal from '@/components/Modal'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

const DeleteUserForm = (props: { forceUserDeletion: boolean }) => {
  const { forceUserDeletion } = props
  const { logout } = useAuth({ middleware: 'auth' })

  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false)
  const passwordInput = useRef<HTMLInputElement>()
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<any>([])
  const [status, setStatus] = useState<string | null>(null)

  const confirmUserDeletion = () => {
    setConfirmingUserDeletion(true)
  }

  const closeModal = () => {
    setConfirmingUserDeletion(false)
  }

  useEffect(() => {
    if (forceUserDeletion) {
      confirmUserDeletion()
    }
  }, [forceUserDeletion])

  const submitForm: FormEventHandler = async event => {
    event.preventDefault()

    await csrf()

    setErrors([])
    setStatus(null)

    axios
      .delete('/api/v1/profile', { data: { password: password } })
      .then(response => {
        setStatus(response.data.status)

        closeModal()
        logout()
      })
      .catch(error => {
        if (error.response.status !== 422) throw error

        passwordInput.current?.focus()

        setErrors(error.response.data.errors)
      })
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Hapus Akun
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Setelah akun Anda dihapus, seluruh informasi dan data akun Anda akan
          terhapus secara permanen. Sebelum menghapus akun Anda, pastikan telah
          membuat cadangan untuk seluruh data dan informasi yang ingin Anda
          simpan.
        </p>
      </header>

      <Button
        variant="destructive"
        onClick={confirmUserDeletion}
        className="mt-2 uppercase tracking-widest"
      >
        Hapus Akun
      </Button>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <form onSubmit={submitForm} className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Apakah Anda yakin ingin menghapus akun Anda?
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Setelah akun Anda dihapus, seluruh informasi dan data akun Anda akan
            terhapus secara permanen. Konfirmasi kata sandi Anda untuk melakukan
            penghapusan akun secara permanen.
          </p>

          <div className="mt-6">
            <Label htmlFor="password" className="sr-only" />

            <Input
              id="password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 block w-3/4"
              autoFocus
              placeholder="Kata Sandi"
            />

            <div>{errors.password}</div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeModal}>
              Batal
            </Button>
            <Button variant="destructive" className="ml-2">
              Hapus Akun
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default DeleteUserForm
