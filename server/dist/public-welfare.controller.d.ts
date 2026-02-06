export declare class PublicWelfareController {
    private readonly logger;
    search(keyword?: string, lifeCycle?: string, page?: string, limit?: string): Promise<{
        programs: ({
            id: any;
            name: any;
            summary: any;
            description: any;
            category: string;
            categoryLabel: any;
            organization: any;
            organizationDept: any;
            regionCode: any;
            regionName: string;
            eligibility: {
                targetGroups: string[];
                lifeCycle: string[];
                conditions: any[];
            };
            benefits: any;
            supportCycle: any;
            supportType: any;
            contactPhone: string;
            detailUrl: any;
            onlineApplicationAvailable: boolean;
            deadline: any;
            dDay: any;
            applicationUrl: any;
            viewCount: number;
            createdAt: any;
            isBookmarked: boolean;
            relevanceScore: number;
        } | {
            id: any;
            name: any;
            summary: any;
            description: any;
            category: string;
            categoryLabel: any;
            organization: any;
            organizationDept: any;
            regionCode: string;
            regionName: string;
            eligibility: {
                targetGroups: any;
                lifeCycle: any;
                conditions: any[];
            };
            benefits: any;
            supportCycle: any;
            supportType: any;
            contactPhone: any;
            detailUrl: any;
            onlineApplicationAvailable: boolean;
            deadline: any;
            dDay: any;
            applicationUrl: any;
            viewCount: number;
            createdAt: any;
            isBookmarked: boolean;
            relevanceScore: number;
        })[];
        pagination: {
            totalCount: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        error?: undefined;
    } | {
        programs: any[];
        pagination: {
            totalCount: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        error: string;
    }>;
    getDetail(servId: string): Promise<{
        program: any;
        error: string;
        relatedPrograms?: undefined;
        isBookmarked?: undefined;
    } | {
        program: {
            id: any;
            name: any;
            summary: any;
            description: any;
            category: string;
            categoryLabel: any;
            organization: any;
            organizationName: any;
            eligibility: {
                targetGroups: any[];
                conditions: any[];
                incomeLevel: any;
                region: string[];
            };
            benefits: any;
            applicationMethods: {
                type: string;
                name: any;
                url: any;
            }[];
            requiredDocuments: any[];
            contactInfo: {
                phone: any;
                website: any;
            };
            contacts: {
                name: any;
                phone: any;
            }[];
            deadline: string;
            applicationUrl: any;
        };
        relatedPrograms: any[];
        isBookmarked: boolean;
        error?: undefined;
    }>;
    private mapCategory;
    private formatDate;
}
