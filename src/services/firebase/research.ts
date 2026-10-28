// =============================================================
// Firestore 연구 서비스 (research 컬렉션, 누구나 읽기)
// =============================================================
import { collection, doc, getDoc, orderBy, where, type DocumentData } from 'firebase/firestore';
import type { Research, ResearchService } from '../types';
import { db } from './app';
import { fetchPage, friendly, str, strList, toIso } from './helpers';

function toResearch(id: string, d: DocumentData): Research {
  return {
    id,
    title: str(d.title),
    summary: str(d.summary),
    authors: strList(d.authors),
    year: typeof d.year === 'number' ? d.year : Number(d.year) || 0,
    tags: strList(d.tags),
    links: Array.isArray(d.links)
      ? d.links
          .filter((l: unknown): l is { label: unknown; url: unknown } => typeof l === 'object' && l !== null)
          .map((l) => ({ label: str(l.label, '링크'), url: str(l.url) }))
      : [],
    createdAt: toIso(d.createdAt),
  };
}

export const firebaseResearchService: ResearchService = {
  async list(options = {}) {
    try {
      const col = collection(db(), 'research');
      // 태그 거르기 + 최신순 (Firestore 색인 필요: docs/firestore-data-model.md 참고)
      const constraints = options.tag
        ? [where('tags', 'array-contains', options.tag), orderBy('createdAt', 'desc')]
        : [orderBy('createdAt', 'desc')];
      return await fetchPage(col, constraints, options, toResearch);
    } catch (err) {
      return friendly(err);
    }
  },

  async get(id) {
    try {
      const snap = await getDoc(doc(db(), 'research', id));
      return snap.exists() ? toResearch(snap.id, snap.data()) : null;
    } catch (err) {
      return friendly(err);
    }
  },
};
