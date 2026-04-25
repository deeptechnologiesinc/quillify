"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileProcessed: (text: string, html: string | null) => void;
  disabled?: boolean;
}

const ACCEPTED = [".txt", ".pdf", ".docx", ".doc"];
const MAX_MB = 10;

export function FileUpload({ onFileProcessed, disabled }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (f: File) => {
    setError("");
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      return;
    }
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError("Unsupported file type. Use .txt, .pdf, or .docx");
      return;
    }
    setFile(f);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse file");
      onFileProcessed(data.text, data.html ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const clear = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${dragging ? "border-indigo-500 bg-indigo-50" : "border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"}
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      onClick={() => !file && !loading && inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={onInputChange} />

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-indigo-600 font-medium">Reading file…</p>
        </div>
      ) : file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-6 h-6 text-indigo-500 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-indigo-900 truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB — extracted</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); clear(); }}
            className="ml-auto p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Drop your file here, or <span className="text-indigo-500 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Supports .txt, .pdf, .docx — up to {MAX_MB}MB</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-red-500 justify-center">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
