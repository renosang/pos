"use client";

import { useState, useCallback } from "react";
import { uploadToImgBB } from "@/app/actions/upload";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string;
}

export default function ImageUpload({ onUpload, currentImage }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);

    const handleUpload = async (file: File) => {
        setUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];

            try {
                const data = await uploadToImgBB(base64);
                if (data.success) {
                    const imageUrl = data.data.url;
                    onUpload(imageUrl);
                    setPreview(imageUrl);
                } else {
                    alert("Lỗi upload: " + (data.error?.message || "Không xác định"));
                }
            } catch (err) {
                console.error("Upload error", err);
                alert("Lỗi kết nối server khi upload");
            } finally {
                setUploading(false);
            }
        };
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleUpload(file);
        }
    }, []);

    return (
        <div
            className="glass-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{
                border: '2px dashed var(--surface-border)',
                textAlign: 'center',
                padding: '0.5rem',
                cursor: 'pointer',
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s',
                borderRadius: '12px',
                background: 'var(--background)',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
        >
            {preview ? (
                <div style={{ position: 'relative', width: '100%' }}>
                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                    <button
                        onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(""); }}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        {uploading ? "Đang tải lên..." : "Kéo thả, click hoặc chụp ảnh để tải lên"}
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment" // Support mobile camera
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        disabled={uploading}
                    />
                </div>
            )}
        </div>
    );
}
