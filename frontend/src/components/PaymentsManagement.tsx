import React, { useState, useEffect, useMemo } from 'react';
import './ManagementComponents.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sessionRate: number;
  active: boolean;
}

interface Session {
  id: string;
  studentId?: string;
  classId?: string;
  date: string;
  duration: number;
  subject: string;
  price: number;
  notes: string;
  status: string;
  type: 'individual' | 'class';
  student?: {
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    students: Array<{
      firstName: string;
      lastName: string;
    }>;
  };
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank' | 'check' | 'mobile';
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  sessionIds: string[];
}

interface PaymentSummary {
  studentId: string;
  studentName: string;
  totalSessions: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  lastPaymentDate?: string;
  unpaidSessions: Session[];
}

interface PaymentsManagementProps {
  sessions: Session[];
  students: Student[];
}

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ 
  sessions, 
  students 
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    amount: '',
    method: 'cash' as 'cash' | 'bank' | 'check' | 'mobile',
    notes: '',
    sessionIds: [] as string[]
  });

  // Calculer les résumés de paiement pour chaque élève
  const paymentSummaries = useMemo((): PaymentSummary[] => {
    return students.map(student => {
      const studentSessions = sessions.filter(s => s.studentId === student.id);
      const studentPayments = payments.filter(p => p.studentId === student.id && p.status === 'completed');
      
      const totalAmount = studentSessions.reduce((sum, session) => sum + session.price, 0);
      const paidAmount = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = totalAmount - paidAmount;
      
      const paidSessionIds = studentPayments.flatMap(p => p.sessionIds);
      const unpaidSessions = studentSessions.filter(s => !paidSessionIds.includes(s.id));
      
      const lastPayment = studentPayments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        totalSessions: studentSessions.length,
        totalAmount,
        paidAmount,
        remainingAmount,
        lastPaymentDate: lastPayment?.date,
        unpaidSessions
      };
    }).filter(summary => summary.totalSessions > 0);
  }, [students, sessions, payments]);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment: Payment = {
      id: Date.now().toString(),
      studentId: newPayment.studentId,
      amount: parseFloat(newPayment.amount),
      date: new Date().toISOString(),
      method: newPayment.method,
      status: 'completed',
      notes: newPayment.notes,
      sessionIds: newPayment.sessionIds
    };

    setPayments([...payments, payment]);
    setNewPayment({
      studentId: '',
      amount: '',
      method: 'cash',
      notes: '',
      sessionIds: []
    });
    setShowAddPayment(false);
  };

  const toggleSessionSelection = (sessionId: string) => {
    setNewPayment(prev => ({
      ...prev,
      sessionIds: prev.sessionIds.includes(sessionId)
        ? prev.sessionIds.filter(id => id !== sessionId)
        : [...prev.sessionIds, sessionId]
    }));
  };

  const getSelectedSessionsTotal = () => {
    return newPayment.sessionIds.reduce((total, sessionId) => {
      const session = sessions.find(s => s.id === sessionId);
      return total + (session?.price || 0);
    }, 0);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'bank': return '🏦';
      case 'check': return '📝';
      case 'mobile': return '📱';
      default: return '💳';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'bank': return 'Virement';
      case 'check': return 'Chèque';
      case 'mobile': return 'Paiement mobile';
      default: return 'Autre';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} DA`;
  };

  const studentUnpaidSessions = selectedStudent 
    ? sessions.filter(s => s.studentId === selectedStudent && 
        !payments.some(p => p.sessionIds.includes(s.id) && p.status === 'completed'))
    : [];

  return (
    <div className="payments-tab">
      <div className="tab-header">
        <h2>Gestion des Paiements</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddPayment(true)}
        >
          💰 Enregistrer un paiement
        </button>
      </div>

      {/* Modal d'ajout de paiement */}
      {showAddPayment && (
        <div className="modal-overlay">
          <div className="modal payment-modal">
            <h3>Enregistrer un paiement</h3>
            <form onSubmit={handleAddPayment}>
              <div className="form-row">
                <label>Élève:</label>
                <select
                  value={newPayment.studentId}
                  onChange={(e) => {
                    setNewPayment({...newPayment, studentId: e.target.value, sessionIds: []});
                    setSelectedStudent(e.target.value);
                  }}
                  required
                >
                  <option value="">Choisir un élève</option>
                  {paymentSummaries.filter(s => s.remainingAmount > 0).map(summary => (
                    <option key={summary.studentId} value={summary.studentId}>
                      {summary.studentName} (Reste: {formatCurrency(summary.remainingAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && studentUnpaidSessions.length > 0 && (
                <div className="form-row">
                  <label>Séances à payer:</label>
                  <div className="sessions-selection">
                    {studentUnpaidSessions.map(session => (
                      <div key={session.id} className="session-checkbox">
                        <input
                          type="checkbox"
                          id={`session-${session.id}`}
                          checked={newPayment.sessionIds.includes(session.id)}
                          onChange={() => toggleSessionSelection(session.id)}
                        />
                        <label htmlFor={`session-${session.id}`}>
                          {new Date(session.date).toLocaleDateString('fr-FR')} - {formatCurrency(session.price)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="selected-total">
                    Total sélectionné: {formatCurrency(getSelectedSessionsTotal())}
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>Montant:</label>
                <input
                  type="number"
                  placeholder="Montant en DA"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <label>Mode de paiement:</label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({...newPayment, method: e.target.value as 'cash' | 'bank' | 'check' | 'mobile'})}
                >
                  <option value="cash">Espèces</option>
                  <option value="bank">Virement bancaire</option>
                  <option value="check">Chèque</option>
                  <option value="mobile">Paiement mobile</option>
                </select>
              </div>

              <div className="form-row">
                <label>Notes:</label>
                <textarea
                  placeholder="Notes optionnelles"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => {
                  setShowAddPayment(false);
                  setSelectedStudent('');
                }}>
                  Annuler
                </button>
                <button type="submit">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Résumé général */}
      <div className="payments-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Revenus totaux</h3>
              <p className="amount">
                {formatCurrency(paymentSummaries.reduce((sum, s) => sum + s.totalAmount, 0))}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Montant perçu</h3>
              <p className="amount paid">
                {formatCurrency(paymentSummaries.reduce((sum, s) => sum + s.paidAmount, 0))}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <h3>En attente</h3>
              <p className="amount pending">
                {formatCurrency(paymentSummaries.reduce((sum, s) => sum + s.remainingAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des paiements par élève */}
      <div className="payments-container">
        <h3>Situation par élève</h3>
        <div className="payments-table">
          <div className="table-header">
            <div>Élève</div>
            <div>Séances</div>
            <div>Total dû</div>
            <div>Payé</div>
            <div>Reste</div>
            <div>Dernier paiement</div>
            <div>Statut</div>
          </div>
          
          {paymentSummaries.map(summary => (
            <div key={summary.studentId} className="table-row">
              <div className="student-name">{summary.studentName}</div>
              <div className="sessions-count">{summary.totalSessions}</div>
              <div className="total-amount">{formatCurrency(summary.totalAmount)}</div>
              <div className="paid-amount">{formatCurrency(summary.paidAmount)}</div>
              <div className={`remaining-amount ${summary.remainingAmount > 0 ? 'unpaid' : 'paid'}`}>
                {formatCurrency(summary.remainingAmount)}
              </div>
              <div className="last-payment">
                {summary.lastPaymentDate 
                  ? new Date(summary.lastPaymentDate).toLocaleDateString('fr-FR')
                  : 'Aucun'
                }
              </div>
              <div className="payment-status">
                <span className={`status-badge ${summary.remainingAmount > 0 ? 'pending' : 'completed'}`}>
                  {summary.remainingAmount > 0 ? 'En attente' : 'À jour'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="payments-history">
        <h3>Historique des paiements</h3>
        <div className="payments-list">
          {payments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(payment => {
              const student = students.find(s => s.id === payment.studentId);
              return (
                <div key={payment.id} className="payment-item">
                  <div className="payment-icon">
                    {getPaymentMethodIcon(payment.method)}
                  </div>
                  <div className="payment-info">
                    <h4>{student?.firstName} {student?.lastName}</h4>
                    <p className="payment-date">
                      {new Date(payment.date).toLocaleDateString('fr-FR')} - 
                      {getPaymentMethodLabel(payment.method)}
                    </p>
                    {payment.notes && <p className="payment-notes">{payment.notes}</p>}
                  </div>
                  <div className="payment-amount">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className={`payment-status ${payment.status}`}>
                    {payment.status === 'completed' ? '✅' : payment.status === 'pending' ? '⏳' : '❌'}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement;
