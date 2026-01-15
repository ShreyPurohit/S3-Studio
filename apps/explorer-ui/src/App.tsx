import { useEffect, useState } from 'react';
import { listBuckets, listObjects, getDownloadUrl } from './api/client';
import './index.css';

// Helper to get file extension and icon
function getFileInfo(filename: string) {
    const parts = filename.split('/');
    const name = parts[parts.length - 1] || parts[parts.length - 2] + '/';
    const isFolder = filename.endsWith('/');

    if (isFolder) {
        return {
            name: name.replace('/', ''),
            icon: '\u{1F4C1}',
            isFolder: true,
        };
    }

    const ext = name.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
        jpg: '\u{1F5BC}\uFE0F',
        jpeg: '\u{1F5BC}\uFE0F',
        png: '\u{1F5BC}\uFE0F',
        gif: '\u{1F5BC}\uFE0F',
        svg: '\u{1F5BC}\uFE0F',
        webp: '\u{1F5BC}\uFE0F',
        pdf: '\u{1F4C4}',
        doc: '\u{1F4DD}',
        docx: '\u{1F4DD}',
        txt: '\u{1F4C4}',
        md: '\u{1F4C4}',
        mp3: '\u{1F3B5}',
        wav: '\u{1F3B5}',
        flac: '\u{1F3B5}',
        mp4: '\u{1F3AC}',
        mov: '\u{1F3AC}',
        avi: '\u{1F3AC}',
        mkv: '\u{1F3AC}',
        zip: '\u{1F4E6}',
        rar: '\u{1F4E6}',
        tar: '\u{1F4E6}',
        gz: '\u{1F4E6}',
        js: '\u{1F4DC}',
        ts: '\u{1F4DC}',
        jsx: '\u{1F4DC}',
        tsx: '\u{1F4DC}',
        json: '\u{1F4CB}',
        html: '\u{1F310}',
        css: '\u{1F3A8}',
    };

    return { name, icon: icons[ext] || '\u{1F4C4}', isFolder: false };
}

export default function App() {
    const [buckets, setBuckets] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [objects, setObjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const b = await listBuckets();
                setBuckets(b);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!selected) return setObjects([]);
        (async () => {
            setLoading(true);
            try {
                const objs = await listObjects(selected);
                setObjects(objs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [selected]);

    const handleDownload = (obj: string) => {
        if (selected) {
            window.open(getDownloadUrl(selected, obj), '_blank');
        }
    };

    return (
        <div className="s3-window">
            {/* Title Bar */}
            <div className="s3-title-bar">
                <div className="s3-window-controls">
                    <button
                        className="s3-window-button s3-close-btn"
                        title="Close"
                    />
                    <button
                        className="s3-window-button s3-minimize-btn"
                        title="Minimize"
                    />
                    <button
                        className="s3-window-button s3-maximize-btn"
                        title="Maximize"
                    />
                </div>
                <div className="s3-title-text">
                    S3 Studio — {selected || 'ObjectExplorer'}
                </div>
                <div className="s3-title-spacer" />
            </div>

            {/* Toolbar */}
            <div className="s3-toolbar">
                <button
                    className="s3-toolbar-btn"
                    onClick={() => setSelected(null)}
                    disabled={!selected}
                    title="Back"
                >
                    ←
                </button>
                <button className="s3-toolbar-btn" disabled title="Forward">
                    →
                </button>
                <button
                    className="s3-toolbar-btn"
                    onClick={() => selected && setSelected(selected)}
                    title="Refresh"
                >
                    ⟳
                </button>

                <div className="s3-address-bar">
                    <span className="s3-address-icon">{'\u{1F4BE}'}</span>
                    <span>{selected ? `s3://${selected}/` : 'S3 Buckets'}</span>
                </div>
            </div>

            {/* Main Area */}
            <div className="s3-main-area">
                {/* Sidebar */}
                <div className="s3-sidebar">
                    <div className="s3-sidebar-section">
                        <div className="s3-sidebar-header">S3 Buckets</div>
                        {loading && buckets.length === 0 ? (
                            <div className="s3-sidebar-loading">Loading...</div>
                        ) : (
                            buckets.map((b) => (
                                <button
                                    key={b}
                                    className={`s3-sidebar-item ${selected === b ? 'selected' : ''}`}
                                    onClick={() => setSelected(b)}
                                >
                                    <span className="s3-sidebar-icon">
                                        {'\u{1FAA3}'}
                                    </span>
                                    {b}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="s3-content">
                    {!selected ? (
                        <div className="s3-content-empty">
                            <div className="s3-empty-icon">{'\u{1FAA3}'}</div>
                            <div>Select a bucket to browse files</div>
                        </div>
                    ) : loading && objects.length === 0 ? (
                        <div className="s3-loading">
                            <div className="s3-spinner" />
                            Loading objects...
                        </div>
                    ) : objects.length === 0 ? (
                        <div className="s3-content-empty">
                            <div className="s3-empty-icon">{'\u{1F4C2}'}</div>
                            <div>This bucket is empty</div>
                        </div>
                    ) : (
                        <div className="s3-file-grid">
                            {objects.map((obj) => {
                                const { name, icon, isFolder } =
                                    getFileInfo(obj);
                                return (
                                    <button
                                        key={obj}
                                        className="s3-file-item"
                                        onClick={() =>
                                            !isFolder && handleDownload(obj)
                                        }
                                        onDoubleClick={() =>
                                            !isFolder && handleDownload(obj)
                                        }
                                        title={obj}
                                    >
                                        <span className="s3-file-icon">
                                            {icon}
                                        </span>
                                        <span className="s3-file-name">
                                            {name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="s3-status-bar">
                <span className="s3-status-left">
                    {selected
                        ? `${objects.length} item${objects.length !== 1 ? 's' : ''}`
                        : `${buckets.length} bucket${buckets.length !== 1 ? 's' : ''}`}
                </span>
                <span>S3 Studio</span>
            </div>
        </div>
    );
}
