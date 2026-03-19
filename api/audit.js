/**
 * Audit Logging Service
 */

/**
 * Creates an audit log entry.
 * @param {import('pg').Pool|import('pg').Client} db The PostgreSQL pool or client.
 * @param {string} jobCardId The ID of the affected job card.
 * @param {string} action The action performed.
 * @param {string} performedBy The user performing the action.
 * @param {object} details JSON details of the action.
 */
export async function createAuditLog(db, jobCardId, action, performedBy, details = {}) {
  const id = Math.random().toString(36).substr(2, 9);
  
  try {
    await db.query(
      'INSERT INTO audit_logs (id, job_card_id, action, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
      [id, jobCardId, action, performedBy, JSON.stringify(details)]
    );
    return true;
  } catch (err) {
    console.error('Audit log failed:', err);
    return false;
  }
}
