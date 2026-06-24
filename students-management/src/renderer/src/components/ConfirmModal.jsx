/* eslint-disable react/prop-types */

function ConfirmModal({ description, isOpen, onCancel, onConfirm, title }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button className="button danger" type="button" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
