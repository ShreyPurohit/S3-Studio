import { useRef, useState, type DragEvent } from 'react';
import { AlertCircle, CheckCircle, File, Loader, Upload, X } from './Icons';

interface UploadModalProps {
    bucketName: string;
    prefix: string;
    onClose: () => void;
    onUploadComplete: () => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

const UploadModal = ({
    bucketName,
    prefix,
    onClose,
    onUploadComplete,
}: UploadModalProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            addFiles(selectedFiles);
        }
    };

    const addFiles = (newFiles: File[]) => {
        const uploadingFiles: UploadingFile[] = newFiles.map((file) => ({
            file,
            progress: 0,
            status: 'pending',
        }));
        setFiles((prev) => [...prev, ...uploadingFiles]);
    };

    const uploadFile = async (fileIndex: number) => {
        const uploadingFile = files[fileIndex];
        const formData = new FormData();
        formData.append('file', uploadingFile.file);
        formData.append('bucket', bucketName);
        formData.append('key', prefix + uploadingFile.file.name);

        try {
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === fileIndex
                        ? { ...f, status: 'uploading' as const, progress: 0 }
                        : f
                )
            );

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 20) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                setFiles((prev) =>
                    prev.map((f, i) =>
                        i === fileIndex && f.status === 'uploading'
                            ? { ...f, progress }
                            : f
                    )
                );
            }

            setFiles((prev) =>
                prev.map((f, i) =>
                    i === fileIndex
                        ? { ...f, status: 'success' as const, progress: 100 }
                        : f
                )
            );
        } catch (error) {
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === fileIndex
                        ? {
                              ...f,
                              status: 'error' as const,
                              error:
                                  error instanceof Error
                                      ? error.message
                                      : 'Upload failed',
                          }
                        : f
                )
            );
        }
    };

    const uploadAll = async () => {
        const pendingFiles = files
            .map((f, i) => ({ file: f, index: i }))
            .filter(({ file }) => file.status === 'pending');

        for (const { index } of pendingFiles) {
            await uploadFile(index);
        }

        onUploadComplete();
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
        );
    };

    const allUploaded =
        files.length > 0 && files.every((f) => f.status === 'success');
    const hasErrors = files.some((f) => f.status === 'error');
    const canUpload = files.some((f) => f.status === 'pending');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Upload Files</h2>
                        <p className="modal-subtitle">
                            to {bucketName}/{prefix || 'root'}
                        </p>
                    </div>
                    <button onClick={onClose} className="modal-close">
                        <X className="icon" size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {files.length === 0 && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        >
                            <div className="drop-zone-icon">
                                <Upload className="icon" size={32} />
                            </div>
                            <h3 className="drop-zone-title">
                                {isDragging
                                    ? 'Drop files here'
                                    : 'Drag & drop files here'}
                            </h3>
                            <p className="drop-zone-text">or</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="browse-button"
                            >
                                Browse Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="upload-list">
                            {files.map((uploadingFile, index) => (
                                <div key={index} className="upload-item">
                                    <div className="upload-item-content">
                                        <div
                                            className={`upload-icon ${uploadingFile.status}`}
                                        >
                                            {uploadingFile.status ===
                                                'success' && (
                                                <CheckCircle
                                                    className="icon"
                                                    size={20}
                                                />
                                            )}
                                            {uploadingFile.status ===
                                                'error' && (
                                                <AlertCircle
                                                    className="icon"
                                                    size={20}
                                                />
                                            )}
                                            {uploadingFile.status ===
                                                'uploading' && (
                                                <Loader
                                                    className="icon spinning"
                                                    size={20}
                                                />
                                            )}
                                            {uploadingFile.status ===
                                                'pending' && (
                                                <File
                                                    className="icon"
                                                    size={20}
                                                />
                                            )}
                                        </div>

                                        <div className="upload-info">
                                            <div className="upload-header">
                                                <p className="upload-filename">
                                                    {uploadingFile.file.name}
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                    disabled={
                                                        uploadingFile.status ===
                                                        'uploading'
                                                    }
                                                    className="remove-file-button"
                                                >
                                                    <X
                                                        className="icon"
                                                        size={16}
                                                    />
                                                </button>
                                            </div>
                                            <p className="upload-size">
                                                {formatFileSize(
                                                    uploadingFile.file.size
                                                )}
                                            </p>

                                            {uploadingFile.status ===
                                                'uploading' && (
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${uploadingFile.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {uploadingFile.status ===
                                                'success' && (
                                                <p className="upload-status success">
                                                    Upload complete
                                                </p>
                                            )}
                                            {uploadingFile.status ===
                                                'error' && (
                                                <p className="upload-status error">
                                                    {uploadingFile.error ||
                                                        'Upload failed'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="add-more-button"
                            >
                                + Add More Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}
                </div>

                {files.length > 0 && (
                    <div className="modal-footer">
                        <div className="upload-summary">
                            {files.length} file{files.length !== 1 ? 's' : ''}{' '}
                            selected
                            {allUploaded && (
                                <span className="summary-status success">
                                    {' '}
                                    • All uploads complete
                                </span>
                            )}
                            {hasErrors && (
                                <span className="summary-status error">
                                    {' '}
                                    • Some uploads failed
                                </span>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button onClick={onClose} className="cancel-button">
                                {allUploaded ? 'Done' : 'Cancel'}
                            </button>
                            {canUpload && (
                                <button
                                    onClick={uploadAll}
                                    className="upload-button"
                                >
                                    Upload All
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadModal;
