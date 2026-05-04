"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DoorSelector, { doors } from "@/components/DoorSelector";

export default function HomePage() {
  const [selectedDoor, setSelectedDoor] = useState("");
  const router = useRouter();

  const proceedToScanner = () => {
    if (!selectedDoor) return;
    const door = doors.find(d => d.id === selectedDoor);
    const doorName = door ? door.name : "";
    router.push(`/scanner?doorId=${selectedDoor}&doorName=${encodeURIComponent(doorName)}`);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 pb-10 max-w-lg mx-auto w-full">
        {/* Brand header */}
        <div className="mb-10 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          <p className="text-gray-400 text-sm">Select an access point to begin scanning</p>
        </div>

        {/* Door selector */}
        <DoorSelector
          selectedDoor={selectedDoor}
          setSelectedDoor={setSelectedDoor}
        />

        {/* CTA */}
        <button
          id="proceed-scan-btn"
          onClick={proceedToScanner}
          disabled={!selectedDoor}
          className="mt-8 w-full py-4 rounded-2xl font-semibold text-base tracking-wide
                     bg-white text-gray-950 shadow-lg
                     hover:bg-gray-100 active:scale-[0.98] transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
        >
          Proceed to Scan
        </button>
      </div>
    </main>
  );
}