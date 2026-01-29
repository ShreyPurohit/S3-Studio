import { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import { HardDrive, Database, FolderOpen } from './components/Icons';

function App() {
    const [buckets, setBuckets] = useState<string[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/buckets');
            if (!response.ok) throw new Error('Failed to fetch buckets');
            const data = await response.json();
            setBuckets(data.data.buckets);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (selectedBucket) {
        return (
            <div className="app-container">
                <div className="top-bar">
                    <div className="top-bar-content">
                        <div className="back-button">
                            <button
                                onClick={() => setSelectedBucket(null)}
                                className="breadcrumb-item"
                            >
                                <HardDrive className="icon" />
                                <span className="breadcrumb-text">
                                    All Buckets
                                </span>
                            </button>
                            <div className="breadcrumb">
                                <span className="breadcrumb-separator">/</span>
                                <Database className="bucket-icon" />
                                <span className="breadcrumb-text">
                                    {selectedBucket}
                                </span>
                            </div>
                        </div>
                        <div className="status-indicator">
                            <div className="status-dot" />
                            <span className="status-text">Connected</span>
                        </div>
                    </div>
                </div>

                <div className="explorer-container">
                    <FileExplorer bucketName={selectedBucket} />
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="header">
                <div className="header-content">
                    <div className="header-icon">
                        <Database className="icon" />
                    </div>
                    <div className="header-text">
                        <h1 className="header-title">S3 Studio</h1>
                        <p className="header-subtitle">
                            Browse and manage your S3 buckets
                        </p>
                    </div>
                </div>
            </div>

            <div className="main-content">
                {loading ? (
                    <div className="centered-message">
                        <div className="spinner" />
                        <p className="message-text">Loading buckets...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <div className="error-title">Error Loading Buckets</div>
                        <p className="error-message">{error}</p>
                        <button onClick={fetchBuckets} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : buckets?.length === 0 ? (
                    <div className="empty-container">
                        <FolderOpen className="empty-icon" />
                        <h3 className="empty-title">No Buckets Found</h3>
                        <p className="empty-message">
                            Create a bucket in your AWS console to get started
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="section-header">
                            <h2 className="section-title">Your S3 Buckets</h2>
                            <p className="section-subtitle">
                                {buckets?.length} bucket
                                {buckets?.length !== 1 ? 's' : ''} available
                            </p>
                        </div>
                        <div className="bucket-grid">
                            {buckets?.map((bucket) => (
                                <button
                                    key={bucket}
                                    onClick={() => {
                                        setSelectedBucket(bucket);
                                    }}
                                    className="bucket-card"
                                >
                                    <div className="bucket-card-content">
                                        <div className="bucket-icon-wrapper">
                                            <Database className="bucket-card-icon" />
                                        </div>
                                        <div className="bucket-info">
                                            <h3 className="bucket-name">
                                                {bucket}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="bucket-footer">
                                        <span className="bucket-footer-text">
                                            Click to browse
                                        </span>
                                        <FolderOpen className="bucket-footer-icon" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
