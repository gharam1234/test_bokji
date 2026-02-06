export declare class MockController {
    private readonly logger;
    getFavorites(page?: string, limit?: string): {
        favorites: any[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        meta: {
            categories: any[];
            upcomingDeadlines: number;
        };
    };
    getAnalyticsSummary(period?: string): {
        period: string;
        totalViews: number;
        totalSearches: number;
        totalFavorites: number;
        recommendationCount: number;
        topCategories: any[];
        recentActivity: any[];
    };
    getActivity(): {
        items: any[];
        total: number;
    };
    getProfile(): {
        id: string;
        name: string;
        completionRate: number;
    };
    getRecommendations(): {
        items: any[];
        total: number;
    };
    getNotifications(): {
        notifications: any[];
        totalCount: number;
        unreadCount: number;
        page: number;
        limit: number;
    };
    getUnreadCount(): {
        count: number;
    };
    getWelfareDetail(id: string): {
        program: any;
        relatedPrograms: any[];
        isBookmarked: boolean;
    };
    toggleBookmark(programId: string): {
        success: boolean;
        isBookmarked: boolean;
        message: string;
    };
}
