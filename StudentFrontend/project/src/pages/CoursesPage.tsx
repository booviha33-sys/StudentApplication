import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, type Course } from '../api/courses';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const emptyForm: Course = { courseId: 0, courseName: '', department: '', duration: 0, fees: 0 };

export default function CoursesPage() {
  const { show } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Course>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        String(c.courseId).includes(q)
    );
  }, [courses, search]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setForm({ ...c });
    setEditing(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.courseName.trim()) return setFormError('Course name is required.');
    if (!form.department.trim()) return setFormError('Department is required.');
    if (!form.courseId || form.courseId <= 0) return setFormError('A valid course ID is required.');
    if (form.duration < 0) return setFormError('Duration cannot be negative.');
    if (form.fees < 0) return setFormError('Fees cannot be negative.');

    setSaving(true);
    try {
      if (editing) {
        await updateCourse(form.courseId, form);
        show('Course updated successfully.', 'success');
      } else {
        await createCourse(form);
        show('Course added successfully.', 'success');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteCourse(deleteId);
      show('Course deleted successfully.', 'success');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete course.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Course Management</h2>
        <p>Manage all course records — add, edit, search, and delete.</p>
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
          <h2>All Courses ({filtered.length})</h2>
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Course
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size={28} label="Loading courses..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={32} />}
            title={search ? 'No matching courses' : 'No courses yet'}
            message={search ? 'Try adjusting your search.' : 'Click "Add Course" to create the first record.'}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Duration (months)</th>
                  <th>Fees</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.courseId}>
                    <td>{c.courseId}</td>
                    <td>{c.courseName}</td>
                    <td>{c.department}</td>
                    <td>{c.duration}</td>
                    <td>₹{c.fees.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon edit" onClick={() => openEdit(c)} title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => setDeleteId(c.courseId)}
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

      <Modal open={modalOpen} title={editing ? 'Edit Course' : 'Add Course'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          {formError && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label>Course ID <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.courseId || ''}
              onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
              disabled={editing || saving}
              placeholder="e.g. 101"
            />
          </div>
          <div className="form-group">
            <label>Course Name <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              disabled={saving}
              placeholder="e.g. Java Programming"
            />
          </div>
          <div className="form-group">
            <label>Department <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              disabled={saving}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="form-group">
            <label>Duration (months) <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.duration || ''}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              disabled={saving}
              placeholder="e.g. 6"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Fees <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.fees || ''}
              onChange={(e) => setForm({ ...form, fees: Number(e.target.value) })}
              disabled={saving}
              placeholder="e.g. 25000"
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
