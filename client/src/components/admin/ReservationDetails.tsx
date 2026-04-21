import React from 'react';

interface GanttReservation {
  id: string
  name: string
  phone: string
  email: string
  time: string
  guests: string
  tableNumber: number | null
  status: string
  hasPreOrder: boolean
  message: string
}

interface ReservationDetailsProps {
  reservation: GanttReservation;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function ReservationDetails({ reservation, onClose, onUpdateStatus }: ReservationDetailsProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reservation Details</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Customer</span>
              <span className="detail-value">{reservation.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{reservation.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{reservation.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time</span>
              <span className="detail-value">{reservation.time}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Guests</span>
              <span className="detail-value">👥 {reservation.guests}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Table</span>
              <span className="detail-value">🪑 {reservation.tableNumber || 'Unassigned'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`detail-value status-badge status-${reservation.status}`}>{reservation.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pre-Order</span>
              <span className="detail-value">{reservation.hasPreOrder ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>
          {reservation.message && (
            <div className="detail-message">
              <span className="detail-label">Message</span>
              <p>"{reservation.message}"</p>
            </div>
          )}
        </div>
        <div className="modal-actions">
          {reservation.status === 'pending' && (
            <>
              <button className="btn-confirm" onClick={() => onUpdateStatus(reservation.id, 'confirmed')}>✅ Confirm</button>
              <button className="btn-cancel" onClick={() => onUpdateStatus(reservation.id, 'cancelled')}>❌ Cancel</button>
            </>
          )}
          {reservation.status === 'confirmed' && (
            <button className="btn-complete" onClick={() => onUpdateStatus(reservation.id, 'completed')}>✔️ Mark Completed</button>
          )}
        </div>
      </div>
    </div>
  )
}
