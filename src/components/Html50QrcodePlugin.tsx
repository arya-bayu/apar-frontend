// file = Html5QrcodePlugin.tsx
import React, { useEffect } from 'react';
import { Html5QrcodeScanner, QrcodeSuccessCallback, QrcodeErrorCallback, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QrDimensionFunction, QrDimensions } from "html5-qrcode/esm/core";

interface Html5QrcodePluginProps {
  fps: number | undefined;
  qrbox?: number | QrDimensions | QrDimensionFunction | undefined;
  aspectRatio?: number | undefined;
  disableFlip?: boolean | undefined;
  verbose?: boolean;
  showTorchButtonIfSupported?: boolean;
  formatsToSupport?: Html5QrcodeSupportedFormats[];
  qrCodeSuccessCallback: QrcodeSuccessCallback;
  qrCodeErrorCallback?: QrcodeErrorCallback;
}

const qrcodeRegionId = 'html5qr-code-full-region';

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodePluginProps) => {
  let config: any = {};

  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  if (props.showTorchButtonIfSupported) {
    config.showTorchButtonIfSupported = props.showTorchButtonIfSupported
  }
  if (props.formatsToSupport) {
    config.formatsToSupport = props.formatsToSupport
  }

  return config;
};

const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {
  useEffect(() => {
    // when component mounts
    const config = createConfig(props);
    const verbose = props.verbose === true;
    // Success callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw new Error('qrCodeSuccessCallback is a required callback.');
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose,
    );
    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback,
    );

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error('Failed to clear html5QrcodeScanner. ', error);
      });
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};

export default Html5QrcodePlugin;
