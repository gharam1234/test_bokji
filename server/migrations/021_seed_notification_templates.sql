-- ============================================
-- 021_seed_notification_templates.sql
-- 알림 템플릿 초기 데이터 삽입
-- ============================================

-- 새 복지 프로그램 알림 템플릿
INSERT INTO notification_template (type, channel, title_template, message_template) VALUES
('new_welfare', 'in_app', '새로운 복지 혜택 안내', '{{programName}} 혜택이 새로 등록되었습니다. 지금 확인해보세요!'),
('new_welfare', 'push', '🎉 새 복지 혜택!', '{{programName}} - 회원님께 맞는 새 혜택이 등록되었어요'),
('new_welfare', 'email', '{{programName}} - 새로운 복지 혜택을 확인하세요', '안녕하세요, {{userName}}님!

회원님의 프로필과 매칭되는 새로운 복지 혜택이 등록되었습니다.

■ {{programName}}
{{programSummary}}

자세한 내용은 아래 링크를 통해 확인해주세요.');

-- 마감 임박 알림 템플릿
INSERT INTO notification_template (type, channel, title_template, message_template) VALUES
('deadline_alert', 'in_app', '마감 임박 알림', '{{programName}} 신청 마감이 {{daysLeft}}일 남았습니다!'),
('deadline_alert', 'push', '⏰ 마감 임박!', '{{programName}} 신청 마감 {{daysLeft}}일 전'),
('deadline_alert', 'email', '{{programName}} 신청 마감이 다가옵니다', '안녕하세요, {{userName}}님!

관심 있으셨던 복지 혜택의 신청 마감이 다가오고 있습니다.

■ {{programName}}
■ 마감일: {{deadline}}

서둘러 신청해주세요!');

-- 프로필 매칭 알림 템플릿
INSERT INTO notification_template (type, channel, title_template, message_template) VALUES
('profile_match', 'in_app', '맞춤 복지 추천', '회원님의 프로필과 {{matchScore}}% 일치하는 {{count}}개의 복지 혜택을 발견했습니다.'),
('profile_match', 'push', '💡 맞춤 추천', '{{matchScore}}% 일치! {{programName}} 확인해보세요'),
('profile_match', 'email', '회원님을 위한 맞춤 복지 추천', '안녕하세요, {{userName}}님!

회원님의 프로필을 분석한 결과, 아래 복지 혜택들이 적합할 것으로 예상됩니다.

{{recommendationList}}

지금 바로 확인해보세요!');

-- 추천 알림 템플릿
INSERT INTO notification_template (type, channel, title_template, message_template) VALUES
('recommendation', 'in_app', '맞춤 복지 추천', '회원님께 딱 맞는 복지 혜택 {{count}}개를 찾았습니다!'),
('recommendation', 'push', '🎯 맞춤 추천 도착', '회원님을 위한 복지 혜택 {{count}}개 추천'),
('recommendation', 'email', '회원님을 위한 맞춤 복지 추천 안내', '안녕하세요, {{userName}}님!

회원님의 프로필과 관심사를 분석하여 맞춤 복지 혜택을 추천드립니다.

{{recommendationList}}

놓치지 말고 신청하세요!');

-- 시스템 알림 템플릿
INSERT INTO notification_template (type, channel, title_template, message_template) VALUES
('system', 'in_app', '{{title}}', '{{message}}'),
('system', 'push', '📢 {{title}}', '{{message}}'),
('system', 'email', '[공지] {{title}}', '안녕하세요, {{userName}}님!

{{message}}

감사합니다.');
