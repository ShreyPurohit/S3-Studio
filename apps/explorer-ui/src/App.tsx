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
    const [currentPrefix, setCurrentPrefix] = useState<string>('');
    const [objects, setObjects] = useState<Record<string, string[]>>({});
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
        if (!selected) {
            setObjects({});
            setCurrentPrefix('');
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const response = await listObjects(
                    selected,
                    currentPrefix || undefined
                );
                setObjects(response.objects);
            } catch (err) {
                console.error('Failed to load objects:', err);
                setObjects({});
            } finally {
                setLoading(false);
            }
        })();
    }, [selected, currentPrefix]);

    const handleItemClick = (key: string, isFolder: boolean) => {
        if (isFolder) {
            // Navigate into folder
            setCurrentPrefix(key);
        } else {
            // Download file
            if (selected) {
                const fullKey = currentPrefix ? `${currentPrefix}${key}` : key;
                window.open(getDownloadUrl(selected, fullKey), '_blank');
            }
        }
    };

    const handleBackClick = () => {
        if (currentPrefix) {
            // Go up one level
            const parts = currentPrefix.split('/').filter((p) => p);
            parts.pop();
            setCurrentPrefix(parts.length > 0 ? parts.join('/') + '/' : '');
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
                    onClick={() => {
                        if (currentPrefix) {
                            handleBackClick();
                        } else {
                            setSelected(null);
                        }
                    }}
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
                    onClick={() => {
                        if (selected) {
                            // Refresh current view
                            const tempPrefix = currentPrefix;
                            setCurrentPrefix('');
                            setTimeout(() => setCurrentPrefix(tempPrefix), 0);
                        }
                    }}
                    title="Refresh"
                >
                    ⟳
                </button>

                <div className="s3-address-bar">
                    <span className="s3-address-icon">{'\u{1F4BE}'}</span>
                    <span>
                        {selected
                            ? `s3://${selected}/${currentPrefix || ''}`
                            : 'S3 Buckets'}
                    </span>
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
                    ) : loading && Object.keys(objects).length === 0 ? (
                        <div className="s3-loading">
                            <div className="s3-spinner" />
                            Loading objects...
                        </div>
                    ) : Object.keys(objects).length === 0 ? (
                        <div className="s3-content-empty">
                            <div className="s3-empty-icon">{'\u{1F4C2}'}</div>
                            <div>
                                This {currentPrefix ? 'folder' : 'bucket'} is
                                empty
                            </div>
                        </div>
                    ) : (
                        <div className="s3-file-grid">
                            {currentPrefix
                                ? // When navigating inside a folder, show files directly
                                  Object.entries(objects).flatMap(
                                      ([folderPath, files]) =>
                                          files.map((file) => {
                                              const fullFileKey = `${folderPath}${file}`;
                                              const {
                                                  name: fileName,
                                                  icon: fileIcon,
                                              } = getFileInfo(file);

                                              return (
                                                  <button
                                                      key={fullFileKey}
                                                      className="s3-file-item"
                                                      onClick={() =>
                                                          handleItemClick(
                                                              fullFileKey,
                                                              false
                                                          )
                                                      }
                                                      onDoubleClick={() =>
                                                          handleItemClick(
                                                              fullFileKey,
                                                              false
                                                          )
                                                      }
                                                      title={fullFileKey}
                                                  >
                                                      <span className="s3-file-icon">
                                                          {fileIcon}
                                                      </span>
                                                      <span className="s3-file-name">
                                                          {fileName}
                                                      </span>
                                                  </button>
                                              );
                                          })
                                  )
                                : // At root level, show folders with their contents
                                  Object.entries(objects).map(
                                      ([folderPath, files]) => (
                                          <div
                                              key={folderPath}
                                              className="s3-folder-group"
                                          >
                                              {/* Folder */}
                                              <button
                                                  className="s3-file-item s3-folder-item"
                                                  onClick={() =>
                                                      handleItemClick(
                                                          folderPath,
                                                          true
                                                      )
                                                  }
                                                  onDoubleClick={() =>
                                                      handleItemClick(
                                                          folderPath,
                                                          true
                                                      )
                                                  }
                                                  title={folderPath}
                                              >
                                                  <span className="s3-file-icon">
                                                      📁
                                                  </span>
                                                  <span className="s3-file-name">
                                                      {folderPath.replace(
                                                          /\/$/,
                                                          ''
                                                      )}
                                                  </span>
                                              </button>

                                              {/* Files in this folder - indented */}
                                              {files.map((file) => {
                                                  const fullFileKey = `${folderPath}${file}`;
                                                  const {
                                                      name: fileName,
                                                      icon: fileIcon,
                                                  } = getFileInfo(file);

                                                  return (
                                                      <button
                                                          key={fullFileKey}
                                                          className="s3-file-item s3-file-in-folder"
                                                          onClick={() =>
                                                              handleItemClick(
                                                                  fullFileKey,
                                                                  false
                                                              )
                                                          }
                                                          onDoubleClick={() =>
                                                              handleItemClick(
                                                                  fullFileKey,
                                                                  false
                                                              )
                                                          }
                                                          title={fullFileKey}
                                                      >
                                                          <span className="s3-file-icon">
                                                              {fileIcon}
                                                          </span>
                                                          <span className="s3-file-name">
                                                              {fileName}
                                                          </span>
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      )
                                  )}
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="s3-status-bar">
                <span className="s3-status-left">
                    {selected
                        ? `${Object.keys(objects).length} folder${Object.keys(objects).length !== 1 ? 's' : ''}`
                        : `${buckets.length} bucket${buckets.length !== 1 ? 's' : ''}`}
                </span>
                <span>S3 Studio</span>
            </div>
        </div>
    );
}
