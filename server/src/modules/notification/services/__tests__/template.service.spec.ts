/**
 * TemplateService 테스트
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from '../template.service';
import { NotificationRepository } from '../../notification.repository';
import { NotificationType, NotificationChannel } from '../../constants/notification.constants';

describe('TemplateService', () => {
  let service: TemplateService;
  let repository: jest.Mocked<NotificationRepository>;

  const mockTemplate = {
    id: 'template-1',
    type: NotificationType.NEW_WELFARE,
    channel: NotificationChannel.IN_APP,
    titleTemplate: '새로운 복지 혜택: {{programName}}',
    messageTemplate: '{{programName}} 혜택이 새로 등록되었습니다. 지금 확인해보세요!',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findTemplate: jest.fn(),
      findTemplatesByType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: NotificationRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    repository = module.get(NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.invalidateCache();
  });

  describe('renderTemplate', () => {
    it('템플릿 변수를 올바르게 치환해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(mockTemplate);

      const result = await service.renderTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
        { programName: '청년 월세 지원' },
      );

      expect(result.title).toBe('새로운 복지 혜택: 청년 월세 지원');
      expect(result.message).toBe('청년 월세 지원 혜택이 새로 등록되었습니다. 지금 확인해보세요!');
    });

    it('템플릿이 없으면 기본 메시지를 반환해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(null);

      const result = await service.renderTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
        { programName: '청년 월세 지원' },
      );

      expect(result.title).toBe('새로운 복지 혜택 안내');
      expect(result.message).toContain('청년 월세 지원');
    });

    it('변수가 없으면 빈 문자열로 치환해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(mockTemplate);

      const result = await service.renderTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
        {},
      );

      expect(result.title).toBe('새로운 복지 혜택: ');
    });

    it('여러 변수를 동시에 치환해야 한다', async () => {
      const multiVarTemplate = {
        ...mockTemplate,
        titleTemplate: '{{userName}}님, {{programName}} 안내',
        messageTemplate: '{{userName}}님께 {{programName}}을 추천드립니다. 매칭률: {{matchScore}}%',
      };
      repository.findTemplate.mockResolvedValue(multiVarTemplate);

      const result = await service.renderTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
        { userName: '홍길동', programName: '청년 월세 지원', matchScore: 95 },
      );

      expect(result.title).toBe('홍길동님, 청년 월세 지원 안내');
      expect(result.message).toBe('홍길동님께 청년 월세 지원을 추천드립니다. 매칭률: 95%');
    });
  });

  describe('getTemplate', () => {
    it('템플릿을 조회해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(mockTemplate);

      const result = await service.getTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
      );

      expect(result).toEqual(mockTemplate);
      expect(repository.findTemplate).toHaveBeenCalledWith(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
      );
    });

    it('캐시된 템플릿을 반환해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(mockTemplate);

      // 첫 번째 조회
      await service.getTemplate(NotificationType.NEW_WELFARE, NotificationChannel.IN_APP);
      // 두 번째 조회 (캐시 사용)
      await service.getTemplate(NotificationType.NEW_WELFARE, NotificationChannel.IN_APP);

      // DB는 한 번만 조회
      expect(repository.findTemplate).toHaveBeenCalledTimes(1);
    });

    it('템플릿이 없으면 null을 반환해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(null);

      const result = await service.getTemplate(
        NotificationType.NEW_WELFARE,
        NotificationChannel.IN_APP,
      );

      expect(result).toBeNull();
    });
  });

  describe('getTemplatesByType', () => {
    it('유형별 모든 템플릿을 조회해야 한다', async () => {
      const templates = [
        { ...mockTemplate, channel: NotificationChannel.IN_APP },
        { ...mockTemplate, id: 'template-2', channel: NotificationChannel.PUSH },
        { ...mockTemplate, id: 'template-3', channel: NotificationChannel.EMAIL },
      ];
      repository.findTemplatesByType.mockResolvedValue(templates);

      const result = await service.getTemplatesByType(NotificationType.NEW_WELFARE);

      expect(result).toHaveLength(3);
      expect(repository.findTemplatesByType).toHaveBeenCalledWith(NotificationType.NEW_WELFARE);
    });
  });

  describe('invalidateCache', () => {
    it('캐시를 무효화해야 한다', async () => {
      repository.findTemplate.mockResolvedValue(mockTemplate);

      // 캐시 채우기
      await service.getTemplate(NotificationType.NEW_WELFARE, NotificationChannel.IN_APP);
      
      // 캐시 무효화
      service.invalidateCache();

      // 다시 조회 시 DB 호출
      await service.getTemplate(NotificationType.NEW_WELFARE, NotificationChannel.IN_APP);

      expect(repository.findTemplate).toHaveBeenCalledTimes(2);
    });
  });

  describe('createContextFromMetadata', () => {
    it('메타데이터에서 컨텍스트를 생성해야 한다', () => {
      const metadata = {
        programId: 'prog-1',
        programName: '청년 월세 지원',
        matchScore: 90,
        deadline: new Date('2026-03-01'),
        category: '주거',
      };

      const context = service.createContextFromMetadata(metadata);

      expect(context.programId).toBe('prog-1');
      expect(context.programName).toBe('청년 월세 지원');
      expect(context.matchScore).toBe(90);
      expect(context.category).toBe('주거');
    });

    it('추가 컨텍스트를 병합해야 한다', () => {
      const metadata = { programName: '청년 월세 지원' };
      const additional = { userName: '홍길동', daysLeft: 7 };

      const context = service.createContextFromMetadata(metadata, additional);

      expect(context.programName).toBe('청년 월세 지원');
      expect(context.userName).toBe('홍길동');
      expect(context.daysLeft).toBe(7);
    });

    it('undefined 메타데이터를 처리해야 한다', () => {
      const context = service.createContextFromMetadata(undefined);

      expect(context.programId).toBeUndefined();
      expect(context.programName).toBeUndefined();
    });
  });

  describe('calculateDaysLeft', () => {
    it('마감일까지 남은 일수를 계산해야 한다', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const daysLeft = service.calculateDaysLeft(futureDate);

      expect(daysLeft).toBe(7);
    });

    it('마감일이 지났으면 0을 반환해야 한다', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const daysLeft = service.calculateDaysLeft(pastDate);

      expect(daysLeft).toBe(0);
    });

    it('문자열 날짜도 처리해야 한다', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const daysLeft = service.calculateDaysLeft(futureDate.toISOString());

      expect(daysLeft).toBe(3);
    });
  });

  describe('기본 메시지', () => {
    beforeEach(() => {
      repository.findTemplate.mockResolvedValue(null);
    });

    it('DEADLINE_ALERT 기본 메시지를 반환해야 한다', async () => {
      const result = await service.renderTemplate(
        NotificationType.DEADLINE_ALERT,
        NotificationChannel.IN_APP,
        { programName: '청년 월세 지원', daysLeft: 3 },
      );

      expect(result.title).toBe('마감 임박 알림');
      expect(result.message).toContain('3일');
    });

    it('PROFILE_MATCH 기본 메시지를 반환해야 한다', async () => {
      const result = await service.renderTemplate(
        NotificationType.PROFILE_MATCH,
        NotificationChannel.IN_APP,
        { matchScore: 95 },
      );

      expect(result.title).toBe('맞춤 복지 추천');
      expect(result.message).toContain('95%');
    });

    it('SYSTEM 기본 메시지를 반환해야 한다', async () => {
      const result = await service.renderTemplate(
        NotificationType.SYSTEM,
        NotificationChannel.IN_APP,
        {},
      );

      expect(result.title).toBe('시스템 알림');
    });
  });
});
