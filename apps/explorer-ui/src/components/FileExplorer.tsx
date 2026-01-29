import { useCallback, useEffect, useState } from 'react';
import {
    ChevronRight,
    Download,
    Folder,
    FolderPlus,
    Home,
    RefreshCw,
    Trash2,
    Upload,
} from '../components/Icons';
import CreateFolderModal from './CreateFolderModal';
import UploadModal from './UploadModal';
import { getDownloadUrl } from '../api/client';

interface ApiResponse {
    status: string;
    message: string;
    data: {
        bucket: string;
        objects: Record<string, string[]>; // Folder paths mapped to file names
    };
}

interface FileExplorerProps {
    bucketName: string;
}

const FileExplorer = ({ bucketName }: FileExplorerProps) => {
    const [objects, setObjects] = useState<Record<string, string[]>>({});
    const [currentPrefix, setCurrentPrefix] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const fetchObjects = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/objects?bucket=${bucketName}&prefix=${currentPrefix}`
            );
            if (!response.ok) throw new Error('Failed to fetch objects');
            const data: ApiResponse = await response.json();

            // Directly use the API response structure
            setObjects(data.data.objects);
        } catch (error) {
            console.error('Error fetching objects:', error);
        } finally {
            setLoading(false);
        }
    }, [bucketName, currentPrefix]);

    useEffect(() => {
        fetchObjects();
    }, [fetchObjects]);

    const navigateToFolder = (folderKey: string) => {
        setCurrentPrefix(folderKey);
        setSelectedItems(new Set());
    };

    const navigateUp = () => {
        const parts = currentPrefix.split('/').filter(Boolean);
        parts.pop();
        setCurrentPrefix(parts.length > 0 ? parts.join('/') + '/' : '');
        setSelectedItems(new Set());
    };

    const downloadFile = async (key: string) => {
        try {
            const url = getDownloadUrl(bucketName, key);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to download file');

            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = key.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const deleteObject = async (key: string) => {
        if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

        try {
            const response = await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bucket: bucketName, key }),
            });

            if (!response.ok) throw new Error('Failed to delete object');
            fetchObjects();
            setSelectedItems(new Set());
        } catch (error) {
            console.error('Error deleting object:', error);
        }
    };

    const breadcrumbs = currentPrefix
        .split('/')
        .filter(Boolean)
        .reduce<string[]>((acc, part) => {
            const prev = acc[acc.length - 1] || '';
            acc.push(prev + part + '/');
            return acc;
        }, []);

    const toggleSelectItem = (key: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedItems(newSelected);
    };

    return (
        <div className="file-explorer">
            <div className="toolbar">
                <div className="toolbar-left">
                    <button
                        onClick={fetchObjects}
                        disabled={loading}
                        className="toolbar-button"
                        title="Refresh"
                    >
                        <RefreshCw
                            className={`icon ${loading ? 'spinning' : ''}`}
                            size={16}
                        />
                    </button>
                    <div className="toolbar-separator" />
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="toolbar-button primary"
                    >
                        <Upload className="icon" size={16} />
                        <span>Upload</span>
                    </button>
                    <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="toolbar-button"
                    >
                        <FolderPlus className="icon" size={16} />
                        <span>New Folder</span>
                    </button>
                </div>
                {selectedItems.size > 0 && (
                    <div className="toolbar-right">
                        <span className="selection-count">
                            {selectedItems.size} selected
                        </span>
                        <button
                            onClick={() => setSelectedItems(new Set())}
                            className="clear-button"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            <div className="breadcrumb-bar">
                <div className="breadcrumb-nav">
                    <button
                        onClick={() => setCurrentPrefix('')}
                        className="breadcrumb-item"
                    >
                        <Home className="icon" size={16} />
                        <span className="breadcrumb-label">Root</span>
                    </button>
                    {breadcrumbs.map((crumb) => {
                        const name = crumb.split('/').filter(Boolean).pop();
                        return (
                            <div key={crumb} className="breadcrumb-path">
                                <ChevronRight
                                    className="icon breadcrumb-separator-icon"
                                    size={16}
                                />
                                <button
                                    onClick={() => setCurrentPrefix(crumb)}
                                    className="breadcrumb-item"
                                >
                                    {name}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="file-list-container">
                {loading ? (
                    <div className="centered-message">
                        <div className="spinner" />
                        <p className="message-text">Loading...</p>
                    </div>
                ) : Object.keys(objects).length === 0 ? (
                    <div className="centered-message">
                        <Folder className="icon empty-folder-icon" size={64} />
                        <p className="message-title">This folder is empty</p>
                        <p className="message-text">
                            Upload files or create a new folder
                        </p>
                    </div>
                ) : (
                    <div className="file-list">
                        {/* Back button when inside a folder */}
                        {currentPrefix && (
                            <button
                                onClick={navigateUp}
                                className="file-item parent-dir"
                            >
                                <div className="file-icon-box folder">
                                    <Folder className="icon" size={20} />
                                </div>
                                <span className="file-name">..</span>
                            </button>
                        )}

                        {/* 
                            CRITICAL FIX FOR ROOT-LEVEL FILES:
                            - At root (prefix=''): 
                                * If key is "/", show files (root-level files)
                                * Otherwise, show folders
                            - Inside folder (prefix='images/'): Show files
                        */}
                        {Object.entries(objects).map(([folderPath, files]) => {
                            const isRootFiles =
                                folderPath === '/' && currentPrefix === '';
                            const isFolder =
                                folderPath !== '/' && currentPrefix === '';
                            const isInsideFolder = currentPrefix !== '';

                            // Handle root-level files (key = "/")
                            if (isRootFiles) {
                                return files.map((fileName) => {
                                    const fullKey = fileName; // Root files don't need prefix
                                    const isSelected =
                                        selectedItems.has(fullKey);

                                    return (
                                        <div
                                            key={fullKey}
                                            className={`file-item ${isSelected ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleSelectItem(fullKey)
                                                }
                                                className="file-checkbox"
                                            />
                                            <div className="file-icon-box file">
                                                <span
                                                    style={{ fontSize: '20px' }}
                                                >
                                                    📄
                                                </span>
                                            </div>
                                            <div className="file-name">
                                                {fileName}
                                            </div>
                                            <div className="file-metadata">
                                                <span className="file-size">
                                                    -
                                                </span>
                                                <span className="file-date">
                                                    -
                                                </span>
                                            </div>
                                            <div className="file-actions">
                                                <button
                                                    onClick={() =>
                                                        downloadFile(fullKey)
                                                    }
                                                    className="action-button"
                                                    title="Download"
                                                >
                                                    <Download
                                                        className="icon"
                                                        size={16}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteObject(fullKey)
                                                    }
                                                    className="action-button delete"
                                                    title="Delete"
                                                >
                                                    <Trash2
                                                        className="icon"
                                                        size={16}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                });
                            }

                            // At root level, show folders (but not "/" which is root files)
                            if (isFolder) {
                                const isSelected =
                                    selectedItems.has(folderPath);
                                const displayName = folderPath.replace(
                                    /\/$/,
                                    ''
                                );

                                return (
                                    <div
                                        key={folderPath}
                                        className={`file-item ${isSelected ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                toggleSelectItem(folderPath)
                                            }
                                            className="file-checkbox"
                                        />
                                        <div
                                            onClick={() =>
                                                navigateToFolder(folderPath)
                                            }
                                            className="file-icon-box folder clickable"
                                        >
                                            <Folder
                                                className="icon folder-icon"
                                                size={20}
                                            />
                                        </div>
                                        <div
                                            onClick={() =>
                                                navigateToFolder(folderPath)
                                            }
                                            className="file-name clickable"
                                        >
                                            {displayName}
                                        </div>
                                        <div className="file-metadata">
                                            <span className="file-size">-</span>
                                            <span className="file-date">-</span>
                                        </div>
                                        <div className="file-actions">
                                            <button
                                                onClick={() =>
                                                    deleteObject(folderPath)
                                                }
                                                className="action-button delete"
                                                title="Delete"
                                            >
                                                <Trash2
                                                    className="icon"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // Inside a folder, show files
                            if (isInsideFolder) {
                                return files.map((fileName) => {
                                    const fullKey = folderPath + fileName;
                                    const isSelected =
                                        selectedItems.has(fullKey);

                                    return (
                                        <div
                                            key={fullKey}
                                            className={`file-item ${isSelected ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() =>
                                                    toggleSelectItem(fullKey)
                                                }
                                                className="file-checkbox"
                                            />
                                            <div className="file-icon-box file">
                                                <span
                                                    style={{ fontSize: '20px' }}
                                                >
                                                    📄
                                                </span>
                                            </div>
                                            <div className="file-name">
                                                {fileName}
                                            </div>
                                            <div className="file-metadata">
                                                <span className="file-size">
                                                    -
                                                </span>
                                                <span className="file-date">
                                                    -
                                                </span>
                                            </div>
                                            <div className="file-actions">
                                                <button
                                                    onClick={() =>
                                                        downloadFile(fullKey)
                                                    }
                                                    className="action-button"
                                                    title="Download"
                                                >
                                                    <Download
                                                        className="icon"
                                                        size={16}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteObject(fullKey)
                                                    }
                                                    className="action-button delete"
                                                    title="Delete"
                                                >
                                                    <Trash2
                                                        className="icon"
                                                        size={16}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                });
                            }

                            return null;
                        })}
                    </div>
                )}
            </div>

            <div className="status-bar">
                <span>
                    {Object.keys(objects).length} item
                    {Object.keys(objects).length !== 1 ? 's' : ''}
                </span>
                <span>{bucketName}</span>
            </div>

            {showUploadModal && (
                <UploadModal
                    bucketName={bucketName}
                    prefix={currentPrefix}
                    onClose={() => setShowUploadModal(false)}
                    onUploadComplete={fetchObjects}
                />
            )}

            {showCreateFolderModal && (
                <CreateFolderModal
                    bucketName={bucketName}
                    currentPrefix={currentPrefix}
                    onClose={() => setShowCreateFolderModal(false)}
                    onFolderCreated={fetchObjects}
                />
            )}
        </div>
    );
};

export default FileExplorer;
