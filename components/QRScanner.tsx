"use client";

import { QrReader } from "react-qr-reader";

interface Props {
  onScanSuccess: (value: string) => void;
}

export default function QRScanner({
  onScanSuccess,
}: Props) {
  return (
    <QrReader
      constraints={{ facingMode: "environment" }}
      onResult={(result) => {
        if (result) {
          onScanSuccess(result.getText());
        }
      }}
      containerStyle={{
        width: "100%",
      }}
    />
  );
}