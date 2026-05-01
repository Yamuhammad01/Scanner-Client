"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import { verifyAccess } from "@/service/api";

export default function ScannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isScanned, setIsScanned] = useState(false);

  const doorId = searchParams.get("doorId") || "";

  const handleScan = async (token: string) => {
    if (isScanned) return;
    setIsScanned(true);

    try {
      const result = await verifyAccess({
        token,
        doorId,
        deviceId: "IPHONE_SCANNER_01",
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(
        "accessResult",
        JSON.stringify(result)
      );

      router.push("/result");
    } catch (error) {
      console.error("Verification error:", error);
      setIsScanned(false);
    }
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isScanned ? "Scanned" : "Scan Access Card"}
      </h1>

      {isScanned ? (
        <div className="flex flex-col items-center justify-center p-12 bg-green-50 border border-green-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-green-800">Scanned!</p>
          <p className="text-gray-600 mt-2">Verifying with backend...</p>
        </div>
      ) : (
        <QRScanner onScanSuccess={handleScan} />
      )}
    </main>
  );
}