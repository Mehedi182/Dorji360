import Toast from './Toast';
import { useToastStore } from '../store/toastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 flex flex-col items-end">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ animationDelay: `${index * 100}ms` }}
          className="animate-slideInRight"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
