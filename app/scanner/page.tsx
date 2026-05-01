"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import { verifyAccess } from "@/service/api";

function ScannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const doorId = searchParams.get("doorId") || "";

  const handleScan = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await verifyAccess({
        token,
        doorId,
        deviceId: "SCANNER_WEB_01",
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem("accessResult", JSON.stringify(result));
      router.push("/result");
    } catch (error) {
      console.error("Verification error:", error);
      // Reset so user can try again
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">QR Access Scanner</h1>
        </div>
        {doorId && (
          <p className="text-sm text-gray-400 ml-12">
            Door: <span className="text-gray-200 font-medium">{doorId.replace(/_/g, " ")}</span>
          </p>
        )}
      </header>

      {/* Scanner area */}
      <div className="flex-1 px-6 pb-6 flex flex-col justify-center gap-6 max-w-lg w-full mx-auto">
        {isProcessing ? (
          /* Processing overlay — shown while API call is in-flight */
          <div className="flex flex-col items-center justify-center gap-5 py-20">
            <div className="w-20 h-20 rounded-full bg-green-900/40 ring-4 ring-green-500/30
                            flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-green-400">QR Code Scanned!</p>
              <p className="text-gray-400 text-sm mt-1">Verifying access...</p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm text-center -mb-2">
              Point the camera at a QR code to scan
            </p>
            <QRScanner onScanSuccess={handleScan} />
          </>
        )}
      </div>
    </main>
  );
}

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
        </main>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}