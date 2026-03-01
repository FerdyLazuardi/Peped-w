import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PanelLeft, FileText, X, Search, Sparkles, Folder, Settings, SearchCode } from 'lucide-react';
import logoUrl from '../../asset/logo Amartha Academy.png';

export default function Sidebar({ isOpen, toggleSidebar }) {
    const [kbFiles, setKbFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load file list from auto-generated manifest.json
    useEffect(() => {
        fetch('/knowledge_base/manifest.json?t=' + Date.now())
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(names => {
                setKbFiles(names.map(name => ({
                    name: name.replace(/\.txt$/i, '.pdf'), // Show as .pdf for UI
                    actualName: name,
                    path: `/knowledge_base/${name}`
                })));
            })
            .catch(() => setKbFiles([]));
    }, []);

    const handleFileClick = async (file) => {
        setSelectedFile(file);
        setFileContent('');
        setIsLoading(true);
        try {
            const res = await fetch(file.path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const content = await res.text();
            setFileContent(content || 'No readable text content found.');
        } catch (err) {
            console.error('[KB] Error reading file:', err);
            setFileContent('❌ Failed to load text: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedFile(null);
        setFileContent('');
    };

    // Portal ensures modal always renders above everything — including the mobile sidebar
    const modal = selectedFile ? ReactDOM.createPortal(
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFile.name}
                    </h3>
                    <button className="modal-close-btn" onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                            <span>&nbsp;Loading content...</span>
                        </div>
                    ) : (
                        fileContent
                    )}
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-icon">
                            <img src={logoUrl} alt="Amartha Logo" />
                        </div>
                        <span>Peped</span>
                    </div>
                    {isOpen && (
                        <button onClick={toggleSidebar} className="hamburger-btn" title="Close sidebar">
                            <PanelLeft size={20} />
                        </button>
                    )}
                </div>



                <div className="sidebar-nav">
                    <button className="nav-item primary" onClick={() => window.location.reload()}>
                        <Sparkles className="nav-icon" size={18} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="sidebar-section">
                    <div className="section-header">
                        <div className="section-title">Knowledge Base</div>
                    </div>

                    <div className="search-container" style={{ marginBottom: '16px' }}>
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {kbFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 5px' }}>
                            No files available.
                        </div>
                    ) : (
                        kbFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, i) => (
                            <div key={i} className="history-item" onClick={() => handleFileClick(file)}>
                                <FileText size={16} color="var(--text-secondary)" />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                                    {file.name}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {modal}
        </>
    );
}
