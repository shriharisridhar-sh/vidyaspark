import { useAuth } from '../../contexts/AuthContext';
import LoginScreen from './LoginScreen';

export default function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (admin && !isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-3xl mb-3">\u26D4</div>
          <h2 className="text-text-primary text-lg font-bold mb-2">Access Denied</h2>
          <p className="text-text-secondary text-sm">You need admin privileges to view this page.</p>
          <a href="/" className="inline-block mt-4 text-accent text-sm hover:underline">Back to home</a>
        </div>
      </div>
    );
  }

  return children;
}
