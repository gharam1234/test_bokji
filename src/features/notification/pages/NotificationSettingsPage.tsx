import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { NotificationSettings } from '../components/NotificationSettings';

export function NotificationSettingsPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSaveComplete = () => {
    // 설정 저장 완료 후 처리 (예: 토스트 메시지 표시)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h1 className="text-lg font-semibold text-gray-900">알림 설정</h1>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <main className="p-4 pb-safe">
        <NotificationSettings onSave={handleSaveComplete} />
      </main>
    </div>
  );
}

export default NotificationSettingsPage;
