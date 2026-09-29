import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, Users, AlertCircle } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent, type Student } from '../api/students';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const emptyForm: Student = { id: 0, name: '', email: '', course: '' };

export default function StudentsPage() {
  const { show } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Student>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        String(s.id).includes(q)
    );
  }, [students, search]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setForm({ ...s });
    setEditing(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) return setFormError('Name is required.');
    if (!form.email.trim()) return setFormError('Email is required.');
    if (!form.course.trim()) return setFormError('Course is required.');
    if (!form.id || form.id <= 0) return setFormError('A valid student ID is required.');

    setSaving(true);
    try {
      if (editing) {
        await updateStudent(form.id, form);
        show('Student updated successfully.', 'success');
      } else {
        await createStudent(form);
        show('Student added successfully.', 'success');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteId);
      show('Student deleted successfully.', 'success');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete student.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Student Management</h2>
        <p>Manage all student records — add, edit, search, and delete.</p>
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
          <h2>All Students ({filtered.length})</h2>
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, email, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Student
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size={28} label="Loading students..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title={search ? 'No matching students' : 'No students yet'}
            message={search ? 'Try adjusting your search.' : 'Click "Add Student" to create the first record.'}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.course}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon edit" onClick={() => openEdit(s)} title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => setDeleteId(s.id)}
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

      <Modal open={modalOpen} title={editing ? 'Edit Student' : 'Add Student'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          {formError && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label>Student ID <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.id || ''}
              onChange={(e) => setForm({ ...form, id: Number(e.target.value) })}
              disabled={editing || saving}
              placeholder="e.g. 1"
            />
          </div>
          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={saving}
              placeholder="e.g. Booviha"
            />
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={saving}
              placeholder="e.g. booviha@gmail.com"
            />
          </div>
          <div className="form-group">
            <label>Course <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              disabled={saving}
              placeholder="e.g. CSE"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Student"
        message={`Are you sure you want to delete this student? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
