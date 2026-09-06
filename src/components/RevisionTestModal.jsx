import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function RevisionTestModal() {
  const { revisionModal, closeRevisionModal, generateRevisionTest, quizManifest } = useApp();
  const modalRef = useRef(null);
  const bootstrapModalRef = useRef(null);
  const [selected, setSelected] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (revisionModal.open) {
      setSelected([]);
      setFilterType('all');
      if (window.bootstrap) {
        bootstrapModalRef.current = new window.bootstrap.Modal(modalRef.current);
        bootstrapModalRef.current.show();
      }
    }
    return () => {
      if (bootstrapModalRef.current) {
        bootstrapModalRef.current.hide();
        bootstrapModalRef.current.dispose();
        bootstrapModalRef.current = null;
      }
    };
  }, [revisionModal.open]);

  if (!revisionModal.open) return null;

  const chapters = quizManifest?.[revisionModal.subject] || {};
  const sortedChapterIds = Object.keys(chapters).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

  function toggle(chapId) {
    setSelected((prev) => (prev.includes(chapId) ? prev.filter((c) => c !== chapId) : [...prev, chapId]));
  }

  function generate() {
    generateRevisionTest(revisionModal.subject, selected, filterType);
  }

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 bg-light rounded-top-4">
            <h5 className="modal-title fw-bold text-primary">📝 Create Revision Test</h5>
            <button type="button" className="btn-close" onClick={closeRevisionModal} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-muted small mb-3">Select the tests you want to include in your revision test. Up to 100 questions will be randomly selected from the chosen tests.</p>
            <div className="mb-3">
              <label htmlFor="revision-filter" className="form-label fw-bold text-secondary small">Filter Questions</label>
              <select className="form-select form-select-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Questions</option>
                <option value="incorrect">Incorrect Only</option>
                <option value="correct">Correct Only</option>
                <option value="unattempted">Unattempted Only</option>
              </select>
            </div>
            <div className="list-group list-group-flush mb-3">
              {sortedChapterIds.map((chapId) => (
                <label key={chapId} className="list-group-item d-flex gap-2 align-items-center">
                  <input className="form-check-input flex-shrink-0" type="checkbox" checked={selected.includes(chapId)} onChange={() => toggle(chapId)} />
                  <span>{chapId}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-footer border-0 justify-content-center pb-4">
            <button type="button" className="btn btn-secondary-custom px-4" onClick={closeRevisionModal}>Cancel</button>
            <button type="button" className="btn btn-primary-custom px-5 shadow" onClick={generate}>🚀 Generate Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}
