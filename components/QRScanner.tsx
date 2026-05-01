"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

interface Props {
  onScanSuccess: (value: string) => void;
}

type CameraFacing = "environment" | "user";
type CameraState = "requesting" | "active" | "error";

export default function QRScanner({ onScanSuccess }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);

  const [facing, setFacing] = useState<CameraFacing>("environment");
  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Keep callback ref stable so the scan loop doesn't stale-close over it
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  // Detect whether the device has more than one camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(cameras.length > 1);
    }).catch(() => {
      // enumerateDevices may fail before permission — default to showing button
      setHasMultipleCameras(true);
    });
  }, []);

  const stopStream = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (facingMode: CameraFacing) => {
    stopStream();
    setCameraState("requesting");
    setErrorMessage("");

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      // Explicitly call play() — critical on iOS Safari & some Android browsers
      await video.play();
      setCameraState("active");
      startScanLoop();
    } catch (err: unknown) {
      stopStream();
      setCameraState("error");

      const name = (err as { name?: string }).name ?? "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMessage(
          "Camera access was denied. Please allow camera permissions in your browser settings and refresh."
        );
      } else if (name === "NotFoundError") {
        setErrorMessage("No camera was found on this device.");
      } else if (name === "NotReadableError") {
        setErrorMessage(
          "Camera is already in use by another application. Please close other apps using the camera."
        );
      } else {
        setErrorMessage("Could not access camera. Please try again.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopStream]);

  const startScanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          onScanSuccessRef.current(code.data);
          return; // Stop loop after a successful scan — parent handles redirect
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Start camera when component mounts or facing changes
  useEffect(() => {
    startCamera(facing);
    return () => stopStream();
  }, [facing, startCamera, stopStream]);

  const swapCamera = () => {
    setFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="relative w-full flex flex-col items-center gap-3">
      {/* Camera viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl"
           style={{ aspectRatio: "4/3" }}>

        {/* Live video feed — always rendered so ref is available */}
        <video
          ref={videoRef}
          muted
          playsInline   // Critical for iOS — prevents fullscreen takeover
          autoPlay
          className="w-full h-full object-cover"
          style={{ display: cameraState === "active" ? "block" : "none" }}
        />

        {/* Scan-frame overlay */}
        {cameraState === "active" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scanning line animation */}
              <span className="absolute inset-x-0 top-0 h-0.5 bg-green-400 opacity-80 animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Requesting state */}
        {cameraState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-gray-600 border-t-white animate-spin" />
            <p className="text-gray-300 text-sm font-medium">Starting camera...</p>
          </div>
        )}

        {/* Error state */}
        {cameraState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-red-900/40 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.293 3.293a1 1 0 011.414 0l8 8a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 010-1.414l8-8z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm text-center leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => startCamera(facing)}
              className="px-5 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for jsQR decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera label + swap button */}
      <div className="flex items-center justify-between w-full px-1">
        <p className="text-sm text-gray-500">
          {facing === "environment" ? "Back Camera" : "Front Camera"}
        </p>

        {hasMultipleCameras && (
          <button
            onClick={swapCamera}
            disabled={cameraState === "requesting"}
            aria-label="Swap camera"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl
                       border border-gray-700 hover:bg-gray-800 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Swap Camera
          </button>
        )}
      </div>
    </div>
  );
}