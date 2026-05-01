"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DoorSelector from "@/components/DoorSelector";

export default function HomePage() {
  const [selectedDoor, setSelectedDoor] = useState("");
  const router = useRouter();

  const proceedToScanner = () => {
    if (!selectedDoor) return;

    router.push(
      `/scanner?doorId=${selectedDoor}`
    );
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <DoorSelector
        selectedDoor={selectedDoor}
        setSelectedDoor={setSelectedDoor}
      />

      <button
        onClick={proceedToScanner}
        className="mt-6 w-full bg-black text-white p-4 rounded-lg"
      >
        Proceed to Scan
      </button>
    </main>
  );
}