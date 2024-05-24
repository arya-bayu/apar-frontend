import React, { useEffect, useState } from 'react'

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
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { ScanLine } from 'lucide-react'
import { CameraDevice } from "html5-qrcode/esm/camera/core"

const qrConfig = {
  fps: 10,
  qrbox: { width: 300, height: 300 },
  focusMode: "continous",
  rememberLastUsedCamera: true,
  showTorchButtonIfSupported: true,
  useBarCodeDetectorIfSupported: true,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  },
}

const barConfig = {
  fps: 10,
  qrbox: { width: 300, height: 150 },
  focusMode: "continous",
  rememberLastUsedCamera: true,
  showTorchButtonIfSupported: true,
  useBarCodeDetectorIfSupported: true,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  },
}

let html5QrCode: Html5Qrcode | null = null;

interface ScannerProps {
  isScanning: boolean;
  onResult: (result: string) => void;
  type: string;
}

export const Scanner = ({ isScanning, onResult, type }: ScannerProps) => {
  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  const [activeCamera, setActiveCamera] = useState<CameraDevice | undefined>();

  useEffect(() => {
    if (!isScanning) {
      handleStop()
    }
  }, [isScanning])

  useEffect(() => {
    html5QrCode = new Html5Qrcode('reader')
    getCameras()
    const oldRegion = document.getElementById('qr-shaded-region')
    oldRegion && oldRegion.remove()
    handleStartCamera()
  }, [])

  const handleStartCamera = () => {
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      onResult(decodedText)
      handleStop()
    }
    html5QrCode?.start(
      { facingMode: 'environment' },
      type === 'QR' ? qrConfig : barConfig,
      qrCodeSuccessCallback,
      () => { }
    )
  }

  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameraList(devices)
          setActiveCamera(devices[0])
        }
      })
      .catch(err => {
        setCameraList([])
      })
  }

  const handleStop = () => {
    try {
      html5QrCode?.stop()
        .then(res => {
          html5QrCode?.clear()
        })
        .catch(err => {
        })
    } catch (err) {
    }
  }

  return (
    <div className="sn:px-0 flex flex-col space-y-4">
      {activeCamera && cameraList.length > 0 && (
        <Select
          value={activeCamera?.id}
          onValueChange={(value) => {
            setActiveCamera(cameraList.find(cam => cam.id === value))
            handleStartCamera()
          }}
        >
          <SelectTrigger className="col-span-4">
            <SelectValue placeholder="Pilih Kamera" />
          </SelectTrigger>
          <SelectContent>
            {cameraList.map(camera => {
              return (
                <SelectItem key={camera.id} value={camera.id}>
                  {camera.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )}
      <div id="reader" className="w-[100%]"></div>
    </div>
  )
}

export interface ScannerDrawerDialogProps {
  scannerType: string;
  onScanResult: (result: string) => void;
}

export function ScannerDrawerDialog({ scannerType, onScanResult }: ScannerDrawerDialogProps) {
  const { isAboveMd } = useBreakpoint('md')
  const [open, setOpen] = useState(false)

  if (isAboveMd) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="aspect-square px-2 py-0">
            <ScanLine size={20} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan barcode</DialogTitle>
            <DialogDescription>
              Pindai barcode produk inventory {process.env.NEXT_PUBLIC_APP_NAME}
            </DialogDescription>
          </DialogHeader>
          <Scanner
            isScanning={open}
            type={scannerType}
            onResult={res => {
              onScanResult(res)
              setOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
    >
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
            isScanning={open}
            type={scannerType}
            onResult={res => {
              onScanResult(res)
              setOpen(false)
            }}
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
