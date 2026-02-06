/**
 * 루트 모듈
 * 모든 기능 모듈을 통합하는 메인 모듈
 */

import { Module } from '@nestjs/common';
import { SearchModule } from './modules/search/search.module';
import { MockController } from './mock.controller';
import { PublicWelfareController } from './public-welfare.controller';
// import { ProfileModule } from './modules/profile/profile.module';
// import { FavoritesModule } from './modules/favorites/favorites.module';
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { NotificationModule } from './modules/notification/notification.module';
// import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    SearchModule,
    // ProfileModule,
    // FavoritesModule,
    // AnalyticsModule,
    // NotificationModule,
    // AdminModule,
  ],
  controllers: [MockController, PublicWelfareController],
  providers: [],
})
export class AppModule {}
