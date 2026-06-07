import { useGameStore } from '../store/gameStore';
import { Sparkles, Info, CheckCircle } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useGameStore();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'rune': return <Sparkles className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };
  
  const getBorderColor = (type: string, customColor?: string) => {
    if (customColor) return customColor;
    switch (type) {
      case 'rune': return '#facc15';
      case 'success': return '#4ade80';
      default: return '#60a5fa';
    }
  };
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-gray-900/95 border-2 rounded-lg px-4 py-3 shadow-lg animate-bounce"
          style={{
            borderColor: getBorderColor(toast.type, toast.color),
            boxShadow: `0 0 20px ${getBorderColor(toast.type, toast.color)}40`,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div style={{ color: getBorderColor(toast.type, toast.color) }}>
            {getIcon(toast.type)}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{toast.title}</p>
            {toast.description && (
              <p className="text-gray-400 text-xs">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
