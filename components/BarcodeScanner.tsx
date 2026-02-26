"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

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
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (!isMounted || !active) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps, qrbox, aspectRatio: 1.0 },
            false
        );

        scanner.render(
            (decodedText) => {
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                if (onScanError) onScanError(errorMessage);
            }
        );

        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [isMounted, active, onScanSuccess, onScanError, fps, qrbox]);

    return (
        <div className="scanner-container">
            <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}></div>
            <style jsx>{`
                .scanner-container {
                    width: 100%;
                    padding: 1rem;
                    background: var(--background);
                    border-radius: 12px;
                    border: 1px solid var(--surface-border);
                }
                #reader__scan_region {
                    background: white !important;
                }
                #reader__dashboard_section_csr button {
                    background: var(--primary) !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                }
            `}</style>
        </div>
    );
}
