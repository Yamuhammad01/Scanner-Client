"use client";

import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";

interface Props {
  onScanSuccess: (value: string) => void;
}

export default function QRScanner({
  onScanSuccess,
}: Props) {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isMounted) {
    return (
      <div className="w-full aspect-square bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
        <span className="text-gray-500 font-medium">Initializing camera...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 font-medium">
          Current: {facingMode === "environment" ? "Back Camera" : "Front Camera"}
        </p>
        <button
          onClick={toggleCamera}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Swap Camera
        </button>
      </div>
      
      <div className="rounded-xl overflow-hidden shadow-md bg-black relative w-full aspect-square">
        <QrReader
          key={facingMode} // Forces remount when camera changes to correctly apply new constraints
          constraints={{ facingMode }}
          onResult={(result) => {
            if (result) {
              onScanSuccess(result.getText());
            }
          }}
          containerStyle={{
            width: "100%",
            height: "100%",
          }}
          videoStyle={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </div>
    </div>
  );
}