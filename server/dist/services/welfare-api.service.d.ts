export interface WelfareListItem {
    servId: string;
    servNm: string;
    servDgst: string;
    jurOrgNm: string;
    trgterIndvdlNm: string;
    lifeNmArray: string;
    intrsThemaNmArray: string;
    srvPvsnNm: string;
}
export interface WelfareDetail {
    servId: string;
    servNm: string;
    servDgst: string;
    jurOrgNm: string;
    trgterIndvdlNm: string;
    slctCritNm: string;
    alwServCn: string;
    aplyMtdNm: string;
    aplyUrlAddr: string;
    inqPlCtadrList: any[];
}
export interface WelfareSearchResult {
    programs: WelfareListItem[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}
export declare class WelfareApiService {
    private readonly logger;
    searchWelfarePrograms(params: {
        keyword?: string;
        lifeArray?: string;
        intrsThemArray?: string;
        page?: number;
        pageSize?: number;
    }): Promise<WelfareSearchResult>;
    getWelfareDetail(servId: string): Promise<WelfareDetail | null>;
}
