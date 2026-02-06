/**
 * 컴포넌트 - 복지 상세 자격 요건
 */

import React from 'react';
import { WelfareProgram } from '../../types';

interface WelfareDetailEligibilityProps {
  program: WelfareProgram;
}

export function WelfareDetailEligibility({ program }: WelfareDetailEligibilityProps) {
  const eligibility = program.eligibilityCriteria || program.eligibility;
  
  if (!eligibility) {
    return null;
  }

  const minAge =
    (eligibility as any).minAge ??
    (eligibility as any).ageMin ??
    (eligibility as any).ageRange?.min;
  const maxAge =
    (eligibility as any).maxAge ??
    (eligibility as any).ageMax ??
    (eligibility as any).ageRange?.max;

  const incomeLevel = (eligibility as any).incomeLevel as string | number | undefined;
  const incomeLevels = (eligibility as any).incomeLevels as Array<string | number> | undefined;
  const incomeText =
    typeof incomeLevel === 'number'
      ? `기준 중위소득 ${incomeLevel}% 이하`
      : incomeLevel ||
        (incomeLevels && incomeLevels.length > 0
          ? `소득 분위 ${incomeLevels.join(', ')}`
          : null);

  const regionsRaw = (eligibility as any).regions || (eligibility as any).region;
  const regions =
    Array.isArray(regionsRaw)
      ? regionsRaw.map((region: any) =>
          typeof region === 'string'
            ? region
            : [region.sido, region.sigungu].filter(Boolean).join(' '),
        )
      : [];

  const householdTypes = (eligibility as any).householdTypes as string[] | undefined;
  const specialConditionsRaw =
    (eligibility as any).specialConditions || (eligibility as any).conditions;
  const specialConditions =
    Array.isArray(specialConditionsRaw)
      ? specialConditionsRaw.map((condition: any) =>
          typeof condition === 'string'
            ? condition
            : condition.label || condition.key || String(condition),
        )
      : [];
  
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">자격 요건</h2>
      
      <div className="space-y-4">
        {/* 연령 */}
        {(minAge || maxAge) && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">🎂</span>
            <div>
              <div className="font-medium text-gray-900">연령 조건</div>
              <div className="text-sm text-gray-600">
                {minAge && maxAge
                  ? `${minAge}세 ~ ${maxAge}세`
                  : minAge
                    ? `${minAge}세 이상`
                    : `${maxAge}세 이하`
                }
              </div>
            </div>
          </div>
        )}
        
        {/* 소득 */}
        {incomeText && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">💵</span>
            <div>
              <div className="font-medium text-gray-900">소득 조건</div>
              <div className="text-sm text-gray-600">
                {incomeText}
              </div>
            </div>
          </div>
        )}
        
        {/* 지역 */}
        {regions.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">📍</span>
            <div>
              <div className="font-medium text-gray-900">거주 지역</div>
              <div className="text-sm text-gray-600">
                {regions.join(', ')}
              </div>
            </div>
          </div>
        )}
        
        {/* 가구 유형 */}
        {householdTypes && householdTypes.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">👨‍👩‍👧‍👦</span>
            <div>
              <div className="font-medium text-gray-900">가구 유형</div>
              <div className="text-sm text-gray-600">
                {householdTypes.join(', ')}
              </div>
            </div>
          </div>
        )}
        
        {/* 특수 조건 */}
        {specialConditions.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⭐</span>
            <div>
              <div className="font-medium text-gray-900">추가 조건</div>
              <ul className="mt-1 space-y-1">
                {specialConditions.map((condition, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {condition}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
