// =============================================================
// mock 수업 자료 서비스: seed.ts의 데이터를 메모리에서 읽기만 합니다.
// =============================================================
import type { TeachingService } from '../types';
import { seedTeaching } from '../../data/seed';
import { clone, delay, paginate } from './storage';

// 최신 학기가 먼저 오도록 정렬 (학기 이름이 "2026-2학기" 형식이라 글자순 정렬로 충분)
const sorted = [...seedTeaching].sort((a, b) => b.semester.localeCompare(a.semester));

export const mockTeachingService: TeachingService = {
  async list(options = {}) {
    await delay();
    return clone(paginate(sorted, options));
  },
};
