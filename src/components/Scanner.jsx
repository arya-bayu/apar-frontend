import React, { useEffect, useState } from 'react'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Html5Qrcode } from 'html5-qrcode'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { ScanLine } from 'lucide-react'

const qrConfig = { fps: 10, qrbox: { width: 300, height: 300 } }
const barConfig = { fps: 10, qrbox: { width: 300, height: 150 } }
let html5QrCode

export const Scanner = forwardRef(({ onResult, type }, ref) => {
  const [cameraList, setCameraList] = useState([])
  const [activeCamera, setActiveCamera] = useState()

  useImperativeHandle(ref, () => ({
    handleStop() {
      handleStop()
    },
  }))

  useEffect(() => {
    html5QrCode = new Html5Qrcode('reader')
    getCameras()
    const oldRegion = document.getElementById('qr-shaded-region')
    oldRegion && oldRegion.remove()
    handleClickAdvanced()
  }, [])

  const handleClickAdvanced = () => {
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.info(decodedResult, decodedText)
      onResult(decodedText)
      handleStop()
    }
    html5QrCode.start(
      { facingMode: 'environment' },
      type === 'QR' ? qrConfig : barConfig,
      qrCodeSuccessCallback,
    )
  }

  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then(devices => {
        console.info(devices)
        if (devices && devices.length) {
          setCameraList(devices)
          setActiveCamera(devices[0])
        }
      })
      .catch(err => {
        console.error(err)
        setCameraList([])
      })
  }

  const onCameraChange = e => {
    if (e.target.selectedIndex) {
      let selectedCamera = e.target.options[e.target.selectedIndex]
      console.info(selectedCamera)
      let cameraId = selectedCamera.dataset.key
      setActiveCamera(cameraList.find(cam => cam.id === cameraId))
    }
  }

  const handleStop = () => {
    try {
      html5QrCode
        .stop()
        .then(res => {
          html5QrCode.clear()
        })
        .catch(err => {
          console.log(err.message)
        })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="sn:px-0 flex flex-col space-y-4">
      {cameraList.length > 0 && (
        <Select value={activeCamera.id} onValueChange={onCameraChange}>
          <SelectTrigger id="camera" className="col-span-4">
            <SelectValue placeholder="Pilih Kamera" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Kamera</SelectLabel>
              {cameraList.map(camera => {
                return (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.label}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <div id="reader" width="100%"></div>
    </div>
  )
})

export function ScannerDrawerDialog(scannerType) {
  const { isAboveMd } = useBreakpoint('md')
  const [open, setOpen] = useState(false)

  const childRef = useRef(null)

  if (isAboveMd) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" className="aspect-square px-2 py-0">
            <ScanLine size={20} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan barcode</DialogTitle>
            <DialogDescription>
              Pindai barcode produk untuk memperoleh kode serial number.
            </DialogDescription>
          </DialogHeader>
          <Scanner
            ref={childRef}
            type={scannerType}
            onResult={res => console.log(res)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      onClose={() => {
        childRef.current.handleStop()
      }}>
      <DrawerTrigger asChild>
        <Button type="button" className="aspect-square px-2 py-0">
          <ScanLine size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Scan barcode</DrawerTitle>
          <DrawerDescription>
            Pindai barcode produk untuk memperoleh kode serial number.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <Scanner
            ref={childRef}
            type={scannerType}
            onResult={res => console.log(res)}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ScannerDrawerDialog
