import { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw,
    Upload,
    FolderPlus,
    Home,
    ChevronRight,
    Folder,
} from './Icons';
import UploadModal from './UploadModal';
import CreateFolderModal from './CreateFolderModel';

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

    const breadcrumbs = currentPrefix
        .split('/')
        .filter(Boolean)
        .reduce<string[]>((acc, part) => {
            const prev = acc[acc.length - 1] || '';
            acc.push(prev + part + '/');
            return acc;
        }, []);

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
                        <RefreshCw className={loading ? 'spinning' : ''} />
                    </button>
                    <div className="toolbar-separator" />
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="toolbar-button primary"
                    >
                        <Upload />
                        <span>Upload</span>
                    </button>
                    <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="toolbar-button"
                    >
                        <FolderPlus />
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
                        <Home />
                        <span className="breadcrumb-label">Root</span>
                    </button>
                    {breadcrumbs.map((crumb) => {
                        const name = crumb.split('/').filter(Boolean).pop();
                        return (
                            <button
                                key={crumb}
                                onClick={() => setCurrentPrefix(crumb)}
                                className="breadcrumb-item"
                            >
                                <ChevronRight className="breadcrumb-separator-icon" />
                                <span className="breadcrumb-path">{name}</span>
                            </button>
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
                        <Folder className="empty-folder-icon" />
                        <p className="message-title">This folder is empty</p>
                        <p className="message-text">
                            Upload files or create a new folder
                        </p>
                    </div>
                ) : (
                    <div className="file-list">
                        {currentPrefix && (
                            <button
                                onClick={navigateUp}
                                className="file-item parent-dir"
                            >
                                <div className="file-icon-box folder">
                                    <Folder className="folder-icon" />
                                </div>
                                <span className="file-name">..</span>
                            </button>
                        )}
                        {Object.entries(objects).map(([folderPath, files]) => (
                            <div key={folderPath}>
                                <button
                                    onClick={() => navigateToFolder(folderPath)}
                                    className="file-item folder"
                                >
                                    <div className="file-icon-box folder">
                                        <Folder className="folder-icon" />
                                    </div>
                                    <span className="file-name">
                                        {folderPath.replace(/\/$/, '')}
                                    </span>
                                </button>
                                {files.map((file) => (
                                    <button
                                        key={`${folderPath}${file}`}
                                        className="file-item"
                                    >
                                        <div className="file-icon-box file">
                                            <span className="file-icon-default" />
                                        </div>
                                        <span className="file-name">
                                            {file}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
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
