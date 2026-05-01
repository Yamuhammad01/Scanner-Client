"use client";

import { useSearchParams, useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";
import { verifyAccess } from "@/service/api";

export default function ScannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const doorId = searchParams.get("doorId") || "";

  const handleScan = async (token: string) => {
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
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Scan Access Card
      </h1>

      <QRScanner onScanSuccess={handleScan} />
    </main>
  );
}