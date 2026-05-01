"use client";

import { useEffect, useState } from "react";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("accessResult");
    if (data) {
      setResult(JSON.parse(data));
    }
  }, []);

  if (!result) return null;

  return (
    <main className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold">
        {result.isGranted
          ? " Access Granted"
          : " Access Denied"}
      </h1>

      <p className="mt-4">{result.message}</p>
      <p>{result.userName}</p>
      <p>{result.role}</p>
    </main>
  );
}