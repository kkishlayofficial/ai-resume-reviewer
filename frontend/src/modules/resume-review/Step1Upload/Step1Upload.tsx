import { useRef, useState } from 'react';
import styles from './Step1Upload.module.css';
import { Button } from '../../../components/ui/Button/Button';

interface Step1UploadProps {
  onExtract: (file: File) => void;
  initialFile?: File | null;
  onFileChange?: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Step1Upload({ onExtract, initialFile, onFileChange }: Step1UploadProps) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx') {
      setFile(f);
      onFileChange?.(f);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptedFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) acceptedFile(picked);
  };

  const handleReplace = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.uploadIconWrapper} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h2 className={styles.title}>Upload Your Resume</h2>
        <p className={styles.subtitle}>Supported formats: PDF and DOCX</p>

        {!file ? (
          <>
            <div
              className={`${styles.dropzone} ${isDragging ? styles.dragOver : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload resume file"
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              <div className={styles.dropzoneInner}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="12" x2="12" y2="18" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
                <p className={styles.dropText}>
                  <span className={styles.dropLink}>Click to upload</span> or drag and drop
                </p>
                <p className={styles.dropSub}>PDF or DOCX · Max 10MB</p>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.filePreview}>
            <div className={styles.fileInfo}>
              <div className={styles.fileIconBox} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className={styles.fileMeta}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {file.name.split('.').pop()?.toUpperCase()} · {formatFileSize(file.size)}
                </span>
              </div>
              <div className={styles.successBadge} aria-label="Uploaded successfully">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="7" fill="#DCFCE7" />
                  <path d="M4 7l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Uploaded successfully
              </div>
            </div>

            <div className={styles.fileActions}>
              <Button variant="secondary" size="sm" onClick={handleReplace}>
                Replace File
              </Button>
              <Button variant="primary" size="md" onClick={() => onExtract(file)}>
                Extract Resume →
              </Button>
            </div>
          </div>
        )}

        {/* Always mounted so handleReplace can trigger it while a file is shown */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-label="Choose resume file"
        />
      </div>
    </div>
  );
}
