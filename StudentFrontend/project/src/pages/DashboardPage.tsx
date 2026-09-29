import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react';
import { getStudents } from '../api/students';
import { getCourses } from '../api/courses';
import { getEnrollments } from '../api/enrollments';
import { getMarks } from '../api/marks';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './DashboardPage.css';

interface Stats {
  students: number;
  courses: number;
  enrollments: number;
  marks: number;
}

export default function DashboardPage() {
  const { studentName } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ students: 0, courses: 0, enrollments: 0, marks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [students, courses, enrollments, marks] = await Promise.all([
          getStudents(),
          getCourses(),
          getEnrollments(),
          getMarks(),
        ]);
        if (cancelled) return;
        setStats({
          students: students.length,
          courses: courses.length,
          enrollments: enrollments.length,
          marks: marks.length,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'blue', path: '/students' },
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'green', path: '/courses' },
    { label: 'Total Enrollments', value: stats.enrollments, icon: GraduationCap, color: 'orange', path: '/enrollments' },
    { label: 'Total Marks Records', value: stats.marks, icon: ClipboardList, color: 'purple', path: '/marks' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back, {studentName || 'Student'}! Here's an overview of your system.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <LoadingSpinner size={32} label="Loading dashboard data..." />
      ) : (
        <>
          <div className="dashboard-cards">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  className={`dash-card dash-card-${card.color}`}
                  onClick={() => navigate(card.path)}
                >
                  <div className="dash-card-top">
                    <div className="dash-card-icon">
                      <Icon size={26} />
                    </div>
                    <div className="dash-card-value">{card.value}</div>
                  </div>
                  <div className="dash-card-label">{card.label}</div>
                  <div className="dash-card-link">
                    View details <ArrowRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="dashboard-welcome">
            <div className="welcome-icon">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3>System Overview</h3>
              <p>
                Your Student Management System is running with {stats.students} students,
                {' '}{stats.courses} courses, {stats.enrollments} enrollments, and {stats.marks} marks records.
                Use the sidebar to navigate to each section and manage your data.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
