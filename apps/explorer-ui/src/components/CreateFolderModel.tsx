import { useState } from 'react';
import { FolderPlus, X, AlertCircle } from './Icons';

interface CreateFolderModalProps {
    bucketName: string;
    currentPrefix: string;
    onClose: () => void;
    onFolderCreated: () => void;
}

const CreateFolderModal = ({
    bucketName,
    currentPrefix,
    onClose,
    onFolderCreated,
}: CreateFolderModalProps) => {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateFolderName = (name: string): boolean => {
        if (!name.trim()) {
            setError('Folder name cannot be empty');
            return false;
        }

        if (name.includes('/')) {
            setError('Folder name cannot contain "/"');
            return false;
        }

        if (name.startsWith('.')) {
            setError('Folder name cannot start with "."');
            return false;
        }

        const invalidChars = /[<>:"|?*\\]/;
        if (invalidChars.test(name)) {
            setError('Folder name contains invalid characters');
            return false;
        }

        setError('');
        return true;
    };

    const handleCreate = async () => {
        if (!validateFolderName(folderName)) return;

        try {
            setLoading(true);
            setError('');

            const folderKey = currentPrefix + folderName + '/';

            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bucket: bucketName,
                    folderKey,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create folder');
            }

            onFolderCreated();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to create folder'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleCreate();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container small"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="modal-header-content">
                        <div className="modal-header-icon">
                            <FolderPlus className="icon" size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title">Create New Folder</h2>
                            <p className="modal-subtitle">
                                in {currentPrefix || 'root'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close">
                        <X className="icon" size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="form-group">
                        <label className="form-label">Folder Name</label>
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                                if (error) validateFolderName(e.target.value);
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter folder name"
                            autoFocus
                            className="form-input"
                        />
                    </div>

                    <div className="path-preview">
                        <p className="path-preview-label">Full Path:</p>
                        <p className="path-preview-value">
                            {bucketName}/{currentPrefix}
                            <span className="path-highlight">
                                {folderName || 'folder-name'}
                            </span>
                            /
                        </p>
                    </div>

                    {error && (
                        <div className="error-box">
                            <AlertCircle
                                className="icon error-icon"
                                size={20}
                            />
                            <p className="error-text">{error}</p>
                        </div>
                    )}

                    <div className="guidelines-box">
                        <p className="guidelines-title">Naming Guidelines:</p>
                        <ul className="guidelines-list">
                            <li>
                                No special characters:{' '}
                                {'<, >, :, ", |, ?, *, \\'}
                            </li>
                            <li>Cannot start with a period (.)</li>
                            <li>Cannot contain forward slashes (/)</li>
                        </ul>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading || !folderName.trim() || !!error}
                        className="create-button"
                    >
                        {loading ? (
                            <>
                                <div className="button-spinner"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <FolderPlus className="icon" size={16} />
                                <span>Create Folder</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;
