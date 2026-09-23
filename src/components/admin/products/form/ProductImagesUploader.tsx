"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  X,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/admin/ui/Button";

interface ProductImagesUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImagesUploader({
  images,
  onChange,
}: ProductImagesUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error al subir ${file.name}`);
        }

        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);

  // Handle Ctrl+V paste from clipboard
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        uploadFiles(imageFiles);
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [uploadFiles]);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    uploadFiles(files);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  return (
    <div className="space-y-3">
      {/* Existing Images Grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((src, i) => (
            <div
              key={src + i}
              className={`relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--dash-surface-2)] border ${
                i === 0
                  ? "border-[var(--dash-accent)] ring-1 ring-[var(--dash-accent)]"
                  : "border-[var(--dash-border)]"
              } shadow-sm shrink-0 group`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />

              {/* Cover badge */}
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 right-1 text-xs font-extrabold uppercase tracking-wide text-center bg-[var(--dash-accent)] text-[var(--dash-bg)] rounded py-0.5 leading-none">
                  Portada
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="absolute bottom-1 left-1 right-1 text-xs font-bold text-center bg-black/75 text-white rounded py-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Portada
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Quitar foto"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[var(--dash-danger)] transition-colors"
              >
                <X size={11} />
              </button>

              {/* Move buttons */}
              {images.length > 1 && (
                <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center"
                    >
                      <ArrowLeft size={10} />
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center"
                    >
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-5 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isDragOver
            ? "border-[var(--dash-accent)] bg-[var(--dash-accent-bg)]"
            : "border-[var(--dash-border)] bg-[var(--dash-surface-2)] hover:border-[var(--dash-accent)]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-[var(--dash-accent)]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs font-semibold">Subiendo imágenes...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[var(--dash-accent)]">
              <Upload size={16} />
              <span className="text-xs font-semibold">
                Hacé clic o arrastrá fotos acá
              </span>
            </div>
            <span className="text-xs text-[var(--dash-muted)]">
              Subida múltiple o pegar directo con <strong>Ctrl + V</strong> (JPG, PNG, WebP)
            </span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* URL Link alternative */}
      <div className="flex items-center justify-between text-xs text-[var(--dash-muted)] pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? "Ocultar URL" : "Agregar por enlace URL"}</span>
        </button>

        {images.length > 0 && (
          <span>
            {images.length} foto{images.length !== 1 ? "s" : ""} cargada{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {showUrlInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            placeholder="https://ejemplo.com/foto-mate.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="admin-input py-1.5 text-xs flex-1"
          />
          <Button variant="secondary" size="sm" onClick={handleAddUrl} type="button">
            Agregar
          </Button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-[var(--dash-danger)] font-medium">
          {uploadError}
        </p>
      )}
    </div>
  );
}

export default ProductImagesUploader;
