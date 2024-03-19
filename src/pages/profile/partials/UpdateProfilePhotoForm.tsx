import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { Form, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { csrf } from '@/lib/axios'
import { AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { useRef } from 'react'
import Image from 'next/image'

const MAX_FILE_SIZE = 10000000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const updateProfilePhotoSchema = z.object({
  photo: z
    .any()
    .refine(
      file => file?.size <= MAX_FILE_SIZE,
      'Ukuran maksimal foto adalah 10MB.',
    )
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG',
    ),
})

const UpdateProfilePhotoForm = () => {
  const { authUser, mutate } = useAuth({ middleware: 'auth' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      form.setValue('photo', e.target.files[0])
      form.handleSubmit(onSubmit)()
    }
  }

  const form = useForm<z.infer<typeof updateProfilePhotoSchema>>({
    resolver: zodResolver(updateProfilePhotoSchema),
  })

  const onSubmit = async (values: z.infer<typeof updateProfilePhotoSchema>) => {
    const data = {
      photo: values.photo,
    }

    try {
      await csrf()

      const formData = new FormData()
      formData.append('photo', data.photo)

      await axios.post('api/v1/profile/photo', formData)

      mutate()
      toast({
        variant: 'success',
        title: 'Sukses',
        description: 'Foto profil telah berhasil diperbarui.',
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const errStatus = error.response?.status
        const errors = error.response?.data.errors
        if (errStatus === 422 && errors.photo) {
          form.setError('photo', {
            type: 'server',
            message: errors.photo,
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
        }
      }
    }
  }

  const handleDeletePhoto = async () => {
    try {
      await axios.delete('api/v1/profile/photo')
      mutate()
      toast({
        variant: 'success',
        title: 'Foto profil berhasil dihapus',
        description: `Foto profil telah dihapus secara permanen`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.errors
            : 'Terjadi kesalahan',
      })
    }
  }

  return (
    <div className="flex flex-col justify-center space-y-6 bg-white px-4 dark:bg-transparent sm:rounded-lg sm:border-[1.5px] sm:border-solid sm:border-zinc-50 sm:pb-6 sm:pt-4 sm:shadow-lg sm:dark:border-[0.1px] sm:dark:border-zinc-700">
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-red-500 text-[8rem] uppercase text-zinc-50 sm:text-[4rem] lg:text-[6rem] xl:text-[8rem]">
        <div className={`${authUser?.photo && 'hidden'}`}>
          {authUser?.name && authUser?.name.charAt(0)}
          <span className="sr-only">User Profile</span>
        </div>

        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${authUser?.photo}`}
          alt={`Foto profil ${authUser?.name}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          className={`${!authUser?.photo && 'hidden'
            } aspect-square w-full rounded-lg`}
        />
      </div>

      <div className="space-y-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              control={form.control}
              name="photo"
              render={({ field }) => {
                const { onChange, ref, ...restFieldProps } = field
                return (
                  <FormItem>
                    <FormControl>
                      <>
                        <Input
                          type="file"
                          accept=".jpg, .jpeg, .png"
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={e => {
                            handleFileChange(e)
                            field.onChange(e)
                          }}
                          {...restFieldProps}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full"
                          onClick={handleButtonClick}
                        >
                          {authUser?.photo ? 'Ubah' : 'Pilih'} Foto
                        </Button>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </form>
        </Form>
        {authUser?.photo && (
          <Button
            variant="destructive"
            type="button"
            className="w-full"
            onClick={handleDeletePhoto}
          >
            Hapus Foto
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Besar file: maksimum 10.000.000 bytes (10 Megabytes). Ekstensi file yang
        diperbolehkan: .JPG .JPEG .PNG
      </p>
    </div>
  )
}

export default UpdateProfilePhotoForm
