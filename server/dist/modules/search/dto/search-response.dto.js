"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIDO_NAMES = exports.CATEGORY_LABELS = void 0;
exports.calculateDDay = calculateDDay;
exports.getRegionName = getRegionName;
exports.createPagination = createPagination;
exports.CATEGORY_LABELS = {
    employment: '취업·창업',
    housing: '주거·금융',
    education: '교육',
    healthcare: '건강·의료',
    childcare: '임신·육아',
    culture: '문화·생활',
    safety: '안전·환경',
    other: '기타',
};
exports.SIDO_NAMES = {
    '11': '서울특별시',
    '26': '부산광역시',
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '36': '세종특별자치시',
    '41': '경기도',
    '42': '강원도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '50': '제주특별자치도',
    '00': '전국',
};
function calculateDDay(deadline) {
    if (!deadline)
        return null;
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
function getRegionName(code) {
    if (!code)
        return '전국';
    const sido = code.substring(0, 2);
    return exports.SIDO_NAMES[sido] || '전국';
}
function createPagination(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);
    return {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
//# sourceMappingURL=search-response.dto.js.map