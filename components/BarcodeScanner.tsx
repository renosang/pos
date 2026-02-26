"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
    fps?: number;
    qrbox?: number;
    active?: boolean;
}

export default function BarcodeScanner({
    onScanSuccess,
    onScanError,
    fps = 10,
    qrbox = 250,
    active = true
}: BarcodeScannerProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [successFlash, setSuccessFlash] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isTransitioningRef = useRef(false);

    // Audio context for beep
    const playBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.warn("Audio beep failed", e);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning && !isTransitioningRef.current) {
                isTransitioningRef.current = true;
                html5QrCodeRef.current.stop()
                    .catch(console.error)
                    .finally(() => { isTransitioningRef.current = false; });
            }
        };
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const startScanner = async () => {
            if (isTransitioningRef.current) return;

            try {
                if (!html5QrCodeRef.current) {
                    html5QrCodeRef.current = new Html5Qrcode("reader");
                }

                if (active) {
                    if (html5QrCodeRef.current.isScanning) {
                        isTransitioningRef.current = true;
                        await html5QrCodeRef.current.stop();
                        isTransitioningRef.current = false;
                    }

                    const config = {
                        fps,
                        qrbox: { width: qrbox, height: qrbox },
                        aspectRatio: 1.0,
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.EAN_13,
                            Html5QrcodeSupportedFormats.EAN_8,
                            Html5QrcodeSupportedFormats.UPC_A,
                            Html5QrcodeSupportedFormats.UPC_E,
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.CODE_39,
                            Html5QrcodeSupportedFormats.QR_CODE
                        ]
                    };

                    isTransitioningRef.current = true;
                    await html5QrCodeRef.current.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            playBeep();
                            setSuccessFlash(true);
                            setTimeout(() => setSuccessFlash(false), 200);
                            onScanSuccess(decodedText);
                        },
                        (errorMessage) => {
                            if (onScanError && !errorMessage.includes("NotFoundException")) {
                                onScanError(errorMessage);
                            }
                        }
                    );
                    setCameraError(null);
                    isTransitioningRef.current = false;
                } else {
                    if (html5QrCodeRef.current.isScanning) {
                        isTransitioningRef.current = true;
                        await html5QrCodeRef.current.stop();
                        isTransitioningRef.current = false;
                    }
                }
            } catch (err: any) {
                console.error("Camera scanner error:", err);
                isTransitioningRef.current = false;
                if (!err.message?.includes("already under transition")) {
                    setCameraError(err.message || "Không thể mở camera. Vui lòng kiểm tra quyền truy cập.");
                    if (onScanError) onScanError(err.message);
                }
            }
        };

        startScanner();

        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning && !isTransitioningRef.current) {
                isTransitioningRef.current = true;
                html5QrCodeRef.current.stop()
                    .catch(console.error)
                    .finally(() => { isTransitioningRef.current = false; });
            }
        };
    }, [isMounted, active, fps, qrbox, onScanSuccess, onScanError]);

    return (
        <div className="scanner-container">
            <div id="reader" className="scanner-view"></div>
            {successFlash && <div className="success-flash"></div>}
            {cameraError && (
                <div className="camera-error">
                    <span className="error-icon">⚠️</span>
                    <p>{cameraError}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Thử lại
                    </button>
                </div>
            )}
            <style jsx>{`
                .scanner-container {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    position: relative;
                    background: #000;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }
                .scanner-view {
                    width: 100%;
                    min-height: 300px;
                    background: #000;
                }
                .success-flash {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.4);
                    z-index: 5;
                    pointer-events: none;
                }
                .camera-error {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                    z-index: 10;
                }
                .error-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                .retry-btn {
                    margin-top: 1rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 8px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                /* Important for mobile video */
                #reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    display: block !important;
                }
                #reader__dashboard_section_csr, 
                #reader__status_span {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
