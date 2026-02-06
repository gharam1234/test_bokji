/**
 * NotificationSettings 컴포넌트
 * 알림 설정 폼
 */

import React from 'react';
import { clsx } from 'clsx';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { SettingsToggle } from './SettingsToggle';
import { QuietHoursPicker } from './QuietHoursPicker';
import { EmailDigestFrequency } from '../../types/notification.types';
import { EMAIL_FREQUENCY_LABELS } from '../../constants/notification.constants';

/**
 * NotificationSettings Props
 */
export interface NotificationSettingsProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * NotificationSettings 컴포넌트
 */
export function NotificationSettings({
  className,
}: NotificationSettingsProps): React.ReactElement {
  const { settings, isLoading, isUpdating, updateSettings } = useNotificationSettings();

  if (isLoading || !settings) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">설정을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-8', className)}>
      {/* 채널별 설정 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 채널</h3>
        <div className="space-y-4 bg-white rounded-lg shadow p-6">
          <SettingsToggle
            label="인앱 알림"
            description="앱 내에서 실시간으로 알림을 받습니다."
            checked={settings.inAppEnabled}
            onChange={(checked) => updateSettings({ inAppEnabled: checked })}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="푸시 알림"
            description="브라우저 또는 모바일 푸시 알림을 받습니다."
            checked={settings.pushEnabled}
            onChange={(checked) => updateSettings({ pushEnabled: checked })}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="이메일 알림"
            description="이메일로 알림을 받습니다."
            checked={settings.emailEnabled}
            onChange={(checked) => updateSettings({ emailEnabled: checked })}
            disabled={isUpdating}
          />
        </div>
      </section>

      {/* 알림 유형별 설정 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 유형</h3>
        <div className="space-y-4 bg-white rounded-lg shadow p-6">
          <SettingsToggle
            label="새 복지 프로그램"
            description="프로필과 매칭되는 새로운 복지 혜택이 등록되면 알림을 받습니다."
            checked={settings.newWelfareEnabled}
            onChange={(checked) => updateSettings({ newWelfareEnabled: checked })}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="마감 임박 알림"
            description="관심 있는 복지 프로그램의 신청 마감이 다가오면 알림을 받습니다."
            checked={settings.deadlineAlertEnabled}
            onChange={(checked) => updateSettings({ deadlineAlertEnabled: checked })}
            disabled={isUpdating}
          />
          <SettingsToggle
            label="맞춤 추천 알림"
            description="회원님을 위한 맞춤 복지 혜택 추천 알림을 받습니다."
            checked={settings.recommendationEnabled}
            onChange={(checked) => updateSettings({ recommendationEnabled: checked })}
            disabled={isUpdating}
          />
        </div>
      </section>

      {/* 방해금지 시간 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">방해금지 시간</h3>
        <div className="space-y-4 bg-white rounded-lg shadow p-6">
          <SettingsToggle
            label="방해금지 모드"
            description="설정한 시간 동안 알림을 받지 않습니다."
            checked={settings.quietHoursEnabled}
            onChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
            disabled={isUpdating}
          />
          {settings.quietHoursEnabled && (
            <QuietHoursPicker
              startTime={settings.quietHoursStart || '22:00'}
              endTime={settings.quietHoursEnd || '08:00'}
              onStartTimeChange={(time) => updateSettings({ quietHoursStart: time })}
              onEndTimeChange={(time) => updateSettings({ quietHoursEnd: time })}
              disabled={isUpdating}
            />
          )}
        </div>
      </section>

      {/* 이메일 수신 빈도 */}
      {settings.emailEnabled && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이메일 수신 빈도</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-2">
              {Object.entries(EMAIL_FREQUENCY_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={clsx(
                    'flex items-center p-3 rounded-lg cursor-pointer',
                    'hover:bg-gray-50 transition-colors',
                    settings.emailDigestFrequency === value && 'bg-blue-50 border border-blue-200',
                  )}
                >
                  <input
                    type="radio"
                    name="emailDigestFrequency"
                    value={value}
                    checked={settings.emailDigestFrequency === value}
                    onChange={() =>
                      updateSettings({ emailDigestFrequency: value as EmailDigestFrequency })
                    }
                    disabled={isUpdating}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default NotificationSettings;
