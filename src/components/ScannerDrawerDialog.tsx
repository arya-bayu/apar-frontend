import React, { PropsWithChildren, useEffect, useState } from 'react'

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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { ScanLine, ZapIcon, ZapOff } from 'lucide-react'
import { BooleanCameraCapability, CameraDevice } from "html5-qrcode/esm/camera/core"

const qrConfig = {
  fps: 30,
  qrbox: { width: 300, height: 300 },
  rememberLastUsedCamera: true,
  showTorchButtonIfSupported: true,
  useBarCodeDetectorIfSupported: true,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  },
}

const barConfig = {
  fps: 30,
  qrbox: { width: 300, height: 150 },
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
  const [activeCamera, setActiveCamera] = useState<CameraDevice | "environment" | "user" | undefined>();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false)
  const [currentCameraHasTorch, setCurrentCameraHasTorch] = useState<boolean>(false)
  const [currentCameraTorchFeature, setCurrentCameraTorchFeature] = useState<BooleanCameraCapability | undefined>(undefined)

  useEffect(() => {
    if (!isScanning && html5QrCode?.isScanning) {
      handleStop()
    }
  }, [isScanning])

  useEffect(() => {
    const initializeScanner = async () => {
      html5QrCode = new Html5Qrcode('reader');
      getCameras();
      const oldRegion = document.getElementById('qr-shaded-region');
      oldRegion && oldRegion.remove();
      !isIOS && await new Promise(resolve => setTimeout(resolve, 1000))
      handleStartCamera({ facingMode: 'environment' });
    };

    initializeScanner();
  }, []);

  const handleStartCamera = async (cameraIdOrConfig: MediaTrackConstraints) => {
    const qrCodeSuccessCallback = (decodedText: string) => {
      onResult(decodedText)
    }

    html5QrCode?.start(
      cameraIdOrConfig,
      type === 'QR' ? qrConfig : barConfig,
      qrCodeSuccessCallback,
      () => { },
    ).then(() => {
      const applyVideoConstraintsWhenScanning = async () => {
        if (html5QrCode?.isScanning) {
          html5QrCode?.applyVideoConstraints({
            // @ts-ignore
            focusMode: "continuous",
            // @ts-ignore
            advanced: [{ zoom: 2.0 }],
          });
        } else {
          setTimeout(applyVideoConstraintsWhenScanning, 100);
        }
      }

      const torchFeature = html5QrCode?.getRunningTrackCameraCapabilities().torchFeature()
      const hasTorch = torchFeature?.isSupported()
      setCurrentCameraHasTorch(hasTorch || false)
      setCurrentCameraTorchFeature(torchFeature || undefined)
      applyVideoConstraintsWhenScanning();
    })
  }

  const getCameras = () => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameraList(devices)
          setActiveCamera("environment")
        }
      })
      .catch(err => {
        setCameraList([])
      })
  }

  const handleStop = () => {
    html5QrCode?.stop()
      .then(res => {
        html5QrCode?.clear()
        setIsTorchOn(false)
      })
      .catch(err => {
      })
  }

  function isCameraDevice(camera: any): camera is CameraDevice {
    return camera && typeof camera === 'object' && 'id' in camera;
  }

  const toggleTorch = () => {
    if (currentCameraHasTorch && currentCameraTorchFeature) {
      const value = currentCameraTorchFeature!.value()
      setIsTorchOn(!value)
      currentCameraTorchFeature!.apply(!value)
    }
  }

  return (
    <div className="sn:px-0 flex flex-col space-y-4">
      {activeCamera && (
        <div className="flex flex-row gap-2">
          <Select
            value={isCameraDevice(activeCamera) ? activeCamera.id : activeCamera}
            onValueChange={async (value) => {
              if (value) {
                setActiveCamera(value === "environment" || value === "user" ? value : cameraList.find(cam => cam.id === value));

                if (html5QrCode?.isScanning) {
                  await html5QrCode.stop();
                  html5QrCode.clear();
                }

                const cameraConfig = value === "environment" || value === "user"
                  ? { facingMode: { exact: value } }
                  : { deviceId: { exact: value } };
                handleStartCamera(cameraConfig);
              }
            }}
          >
            <SelectTrigger className="col-span-4">
              <SelectValue placeholder="Pilih Kamera" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Facing Mode</SelectLabel>
                <SelectItem value={"environment"}>
                  Back Camera
                </SelectItem>
                <SelectItem value={"user"}>
                  Front Camera
                </SelectItem>
              </SelectGroup>
              {cameraList.length > 2 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Advanced</SelectLabel>
                    {cameraList.map(camera => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
          {(currentCameraHasTorch && currentCameraTorchFeature) && (
            <Button
              size="icon"
              variant="outline"
              aria-label="Toggle torch"
              className="aspect-square px-2 py-0"
              onClick={() =>
                toggleTorch()
              }>
              {isTorchOn ? <ZapIcon size={15} /> : <ZapOff size={15} />}
            </Button>
          )}
        </div>
      )}
      <div id="reader" className="w-[100%]"></div>
    </div>
  )
}

export interface ScannerDrawerDialogProps {
  scannerType: string;
  onScanResult: (result: string) => void;
}

export function ScannerDrawerDialog({ scannerType, onScanResult, children }: PropsWithChildren<ScannerDrawerDialogProps>) {
  const { isAboveMd } = useBreakpoint('md')
  const [open, setOpen] = useState(false)

  if (isAboveMd) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Scan barcode { }</DialogTitle>
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
        {children}
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
            <Button onClick={() => setOpen(false)} variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ScannerDrawerDialog
