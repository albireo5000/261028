// =============================================================
// mock 연구 서비스: seed.ts의 데이터를 메모리에서 읽기만 합니다.
// =============================================================
import type { ResearchService } from '../types';
import { seedResearch } from '../../data/seed';
import { clone, delay, paginate } from './storage';

// 최신 연구가 먼저 오도록 정렬
const sorted = [...seedResearch].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const mockResearchService: ResearchService = {
  async list(options = {}) {
    await delay();
    const filtered = options.tag ? sorted.filter((r) => r.tags.includes(options.tag!)) : sorted;
    return clone(paginate(filtered, options));
  },

  async get(id) {
    await delay();
    const found = sorted.find((r) => r.id === id);
    return found ? clone(found) : null;
  },
};
