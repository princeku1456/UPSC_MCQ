import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function StartQuizModal() {
  const { startModal, closeStartModal, showChapters } = useApp();
  const modalRef = useRef(null);
  const bootstrapModalRef = useRef(null);

  useEffect(() => {
    if (!startModal) return;
    if (typeof window !== 'undefined' && window.bootstrap) {
      bootstrapModalRef.current = new window.bootstrap.Modal(modalRef.current, {
        backdrop: 'static',
        keyboard: false,
      });
      bootstrapModalRef.current.show();
    }
    return () => {
      if (bootstrapModalRef.current) {
        bootstrapModalRef.current.hide();
        bootstrapModalRef.current.dispose();
        bootstrapModalRef.current = null;
      }
    };
  }, [startModal]);

  if (!startModal) return null;

  const durationMin = Math.ceil(startModal.numQuestions * 1.2);

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 bg-light rounded-top-4">
            <h5 className="modal-title fw-bold text-primary">Ready to Start?</h5>
          </div>
          <div className="modal-body p-4 text-center">
            <div className="mb-4">
              <div className="display-1 mb-3">📝</div>
              <h4 className="fw-bold mb-2">{startModal.subject}</h4>
              <p className="text-muted">{startModal.chapter}</p>
            </div>
            <div className="row g-3 justify-content-center mb-4">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Questions</small>
                  <span className="fs-4 fw-bold text-dark">{startModal.numQuestions}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Duration</small>
                  <span className="fs-4 fw-bold text-dark">{durationMin}m</span>
                </div>
              </div>
            </div>
            <div className="alert alert-info border-0 d-flex align-items-center" role="alert">
              <i className="bi bi-info-circle-fill me-2 fs-5"></i>
              <div className="small text-start">Once you start, the timer will begin. Good luck!</div>
            </div>
          </div>
          <div className="modal-footer border-0 justify-content-center pb-4">
            <button type="button" className="btn btn-secondary-custom px-4" onClick={() => { closeStartModal(); showChapters(startModal.subject); }}>Cancel</button>
            <button type="button" className="btn btn-primary-custom px-5 shadow pulse-button" onClick={startModal.onStart}>🚀 Start Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}
