import React, { useState } from 'react';
import { X, FileText, ExternalLink, Download, Eye, FileCheck } from 'lucide-react';

const DocumentViewerModal = ({ documents, applicantName, onClose }) => {
  const [selectedDoc, setSelectedDoc] = useState(documents && documents.length > 0 ? documents[0] : null);

  if (!documents || documents.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="card-header">
            <h3>No Documents</h3>
            <button className="btn btn-outline btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
          <p>No documents uploaded for this application.</p>
        </div>
      </div>
    );
  }

  const getFullUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    const base = import.meta.env.VITE_API_URL || '';
    return `${base}${filePath}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '850px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={22} color="var(--primary-600)" />
              Supporting Document Verification
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Applicant: <strong>{applicantName}</strong> ({documents.length} files attached)
            </span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', minHeight: '380px' }}>
          {/* Document list side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-light)', paddingRight: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Uploaded Files
            </span>
            {documents.map((doc, idx) => {
              const isSelected = selectedDoc && (selectedDoc._id === doc._id || selectedDoc.filePath === doc.filePath);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDoc(doc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--primary-600)' : 'var(--border-light)'}`,
                    background: isSelected ? 'var(--primary-50)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--primary-800)' : 'var(--text-main)' }}>
                    <FileText size={16} color={isSelected ? 'var(--primary-600)' : '#64748b'} />
                    {doc.docLabel || doc.docType || 'Document'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {doc.originalName || doc.fileName}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview panel side */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedDoc ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedDoc.docLabel || 'Document'}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {selectedDoc.originalName} {selectedDoc.fileSize ? `(${(selectedDoc.fileSize / 1024).toFixed(1)} KB)` : ''}
                    </div>
                  </div>
                  <a
                    href={getFullUrl(selectedDoc.filePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink size={14} /> Open Full / Download
                  </a>
                </div>

                {/* Preview Frame */}
                <div style={{
                  flex: 1,
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '280px',
                  overflow: 'hidden',
                }}>
                  {selectedDoc.filePath?.match(/\.(jpeg|jpg|png|webp)$/i) ? (
                    <img
                      src={getFullUrl(selectedDoc.filePath)}
                      alt="Document Proof Preview"
                      style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
                    />
                  ) : (
                    <iframe
                      src={getFullUrl(selectedDoc.filePath)}
                      title="Document Preview"
                      style={{ width: '100%', height: '350px', border: 'none' }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Select a document to preview
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Document Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
