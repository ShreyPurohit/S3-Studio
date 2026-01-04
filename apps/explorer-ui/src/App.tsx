import { useEffect, useState } from 'react';
import { listBuckets, listObjects, getDownloadUrl } from './api/client';

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

    return (
        <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
            <h1>ObjectExplorer</h1>
            <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ width: 240 }}>
                    <h3>Buckets</h3>
                    {loading && buckets.length === 0 ? (
                        <div>Loading...</div>
                    ) : (
                        <ul>
                            {buckets.map((b) => (
                                <li key={b}>
                                    <button
                                        onClick={() => setSelected(b)}
                                        style={{
                                            background:
                                                selected === b
                                                    ? '#eee'
                                                    : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {b}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h3>Objects {selected ? `in ${selected}` : ''}</h3>
                    {!selected ? (
                        <div>Select a bucket</div>
                    ) : loading && objects.length === 0 ? (
                        <div>Loading...</div>
                    ) : (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: 8,
                                        }}
                                    >
                                        Name
                                    </th>
                                    <th style={{ padding: 8 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {objects.map((o) => (
                                    <tr key={o}>
                                        <td style={{ padding: 8 }}>{o}</td>
                                        <td style={{ padding: 8 }}>
                                            <a
                                                href={getDownloadUrl(
                                                    selected!,
                                                    o
                                                )}
                                            >
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
