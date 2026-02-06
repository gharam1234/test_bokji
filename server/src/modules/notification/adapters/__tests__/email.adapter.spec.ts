/**
 * EmailAdapter 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EmailAdapter } from '../email.adapter';
import { TemplateService } from '../../services/template.service';
import { Pool } from 'pg';
import { NotificationType, NotificationChannel } from '../../constants/notification.constants';
import { Notification } from '../../entities/notification.entity';

describe('EmailAdapter', () => {
  let adapter: EmailAdapter;
  let pool: jest.Mocked<Pool>;
  let templateService: jest.Mocked<TemplateService>;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.NEW_WELFARE,
    title: '새로운 복지 혜택',
    message: '맞춤형 복지 정보가 등록되었습니다.',
    linkUrl: '/welfare/123',
    metadata: { programId: 'prog-1' },
    isRead: false,
    createdAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    name: '홍길동',
  };

  beforeEach(async () => {
    const mockPool = {
      query: jest.fn(),
    };

    const mockTemplateService = {
      renderTemplate: jest.fn().mockResolvedValue({
        title: '새로운 복지 혜택',
        message: '맞춤형 복지 정보가 등록되었습니다.',
      }),
      createContextFromMetadata: jest.fn().mockReturnValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAdapter,
        { provide: Pool, useValue: mockPool },
        { provide: TemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    adapter = module.get<EmailAdapter>(EmailAdapter);
    pool = module.get(Pool);
    templateService = module.get(TemplateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('SendGrid 미설정 시 false를 반환해야 한다', async () => {
      const result = await adapter.send('user-1', mockNotification);

      expect(result).toBe(false);
    });

    it('사용자 이메일이 없으면 false를 반환해야 한다', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await adapter.send('user-1', mockNotification);

      expect(result).toBe(false);
    });
  });

  describe('sendBulk', () => {
    it('여러 사용자에게 발송 결과를 반환해야 한다', async () => {
      const userIds = ['user-1', 'user-2'];

      const results = await adapter.sendBulk(userIds, mockNotification);

      expect(results.size).toBe(2);
      expect(results.get('user-1')).toBe(false); // SendGrid 미설정
      expect(results.get('user-2')).toBe(false);
    });
  });

  describe('sendDigest', () => {
    it('SendGrid 미설정 시 false를 반환해야 한다', async () => {
      const notifications = [mockNotification, { ...mockNotification, id: 'notif-2' }];

      const result = await adapter.sendDigest('user-1', notifications);

      expect(result).toBe(false);
    });

    it('빈 알림 배열이면 false를 반환해야 한다', async () => {
      const result = await adapter.sendDigest('user-1', []);

      expect(result).toBe(false);
    });
  });

  describe('setFromAddress', () => {
    it('발신자 이메일을 설정해야 한다', () => {
      expect(() => {
        adapter.setFromAddress('noreply@example.com');
      }).not.toThrow();
    });

    it('발신자 이름도 설정할 수 있어야 한다', () => {
      expect(() => {
        adapter.setFromAddress('noreply@example.com', '복지 플랫폼');
      }).not.toThrow();
    });
  });

  describe('initialize', () => {
    it('초기화 호출 시 예외를 던지지 않아야 한다', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('API 키 없이 초기화해도 예외를 던지지 않아야 한다', async () => {
      await expect(adapter.initialize(undefined)).resolves.not.toThrow();
    });
  });

  describe('사용자 정보 조회', () => {
    beforeEach(() => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ email: 'user@example.com' }] })
        .mockResolvedValueOnce({ rows: [{ name: '홍길동' }] });
    });

    it('사용자 이메일을 조회해야 한다', async () => {
      await adapter.send('user-1', mockNotification);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('email'),
        ['user-1'],
      );
    });
  });

  describe('템플릿 렌더링', () => {
    it('이메일 템플릿을 렌더링해야 한다', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ email: 'user@example.com' }] })
        .mockResolvedValueOnce({ rows: [{ name: '홍길동' }] });

      await adapter.send('user-1', mockNotification);

      expect(templateService.renderTemplate).toHaveBeenCalledWith(
        NotificationType.NEW_WELFARE,
        NotificationChannel.EMAIL,
        expect.any(Object),
      );
    });
  });
});
