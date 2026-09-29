import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  type Enrollment,
  type EnrollmentStatus,
} from '../api/enrollments';
import { getStudents } from '../api/students';
import { getCourses } from '../api/courses';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STATUS_OPTIONS: EnrollmentStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

const todayStr = () => new Date().toISOString().split('T')[0];

const emptyForm: Enrollment = {
  enrollmentId: 0,
  studentId: 0,
  courseId: 0,
  enrollmentDate: todayStr(),
  status: 'ACTIVE',
};

export default function EnrollmentsPage() {
  const { show } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<{ courseId: number; courseName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Enrollment>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [enr, studs, crs] = await Promise.all([getEnrollments(), getStudents(), getCourses()]);
      setEnrollments(enr);
      setStudents(studs.map((s) => ({ id: s.id, name: s.name })));
      setCourses(crs.map((c) => ({ courseId: c.courseId, courseName: c.courseName })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const studentName = (id: number) => students.find((s) => s.id === id)?.name || `#${id}`;
  const courseName = (id: number) => courses.find((c) => c.courseId === id)?.courseName || `#${id}`;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return enrollments;
    return enrollments.filter((e) => {
      return (
        String(e.enrollmentId).includes(q) ||
        String(e.studentId).includes(q) ||
        String(e.courseId).includes(q) ||
        studentName(e.studentId).toLowerCase().includes(q) ||
        courseName(e.courseId).toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.enrollmentDate.includes(q)
      );
    });
  }, [enrollments, search, students, courses]);

  const openAdd = () => {
    setForm({ ...emptyForm, enrollmentDate: todayStr() });
    setEditing(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (e: Enrollment) => {
    setForm({ ...e });
    setEditing(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.studentId || form.studentId <= 0) return setFormError('Please select a student.');
    if (!form.courseId || form.courseId <= 0) return setFormError('Please select a course.');
    if (!form.enrollmentDate) return setFormError('Enrollment date is required.');
    if (!editing && (!form.enrollmentId || form.enrollmentId <= 0))
      return setFormError('A valid enrollment ID is required.');

    setSaving(true);
    try {
      if (editing) {
        await updateEnrollment(form.enrollmentId, {
          studentId: form.studentId,
          courseId: form.courseId,
          enrollmentDate: form.enrollmentDate,
          status: form.status,
        });
        show('Enrollment updated successfully.', 'success');
      } else {
        await createEnrollment(form);
        show('Enrollment added successfully.', 'success');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save enrollment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteEnrollment(deleteId);
      show('Enrollment deleted successfully.', 'success');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete enrollment.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (status: EnrollmentStatus) => {
    const cls = status === 'ACTIVE' ? 'badge-active' : status === 'COMPLETED' ? 'badge-completed' : 'badge-cancelled';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Enrollment Management</h2>
        <p>Manage student-course enrollments — add, edit, search, and delete.</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={fetchData}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <h2>All Enrollments ({filtered.length})</h2>
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by student, course, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Enrollment
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size={28} label="Loading enrollments..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={32} />}
            title={search ? 'No matching enrollments' : 'No enrollments yet'}
            message={search ? 'Try adjusting your search.' : 'Click "Add Enrollment" to create the first record.'}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.enrollmentId}>
                    <td>{e.enrollmentId}</td>
                    <td>{studentName(e.studentId)}</td>
                    <td>{courseName(e.courseId)}</td>
                    <td>{e.enrollmentDate}</td>
                    <td>{statusBadge(e.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon edit" onClick={() => openEdit(e)} title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => setDeleteId(e.enrollmentId)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Enrollment' : 'Add Enrollment'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          {formError && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {!editing && (
            <div className="form-group">
              <label>Enrollment ID <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                value={form.enrollmentId || ''}
                onChange={(e) => setForm({ ...form, enrollmentId: Number(e.target.value) })}
                disabled={saving}
                placeholder="e.g. 1"
              />
            </div>
          )}

          <div className="form-group">
            <label>Student <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })}
              disabled={saving}
            >
              <option value={0}>Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (#{s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
              disabled={saving}
            >
              <option value={0}>Select a course...</option>
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseName} (#{c.courseId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Enrollment Date <span className="required">*</span></label>
            <input
              className="form-input"
              type="date"
              value={form.enrollmentDate}
              onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Status <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EnrollmentStatus })}
              disabled={saving}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Enrollment' : 'Add Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Enrollment"
        message="Are you sure you want to delete this enrollment? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
