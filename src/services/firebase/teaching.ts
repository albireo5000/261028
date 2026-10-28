// =============================================================
// Firestore 수업 자료 서비스 (teaching 컬렉션, 누구나 읽기)
// =============================================================
import { collection, orderBy, type DocumentData } from 'firebase/firestore';
import type { TeachingMaterial, TeachingService } from '../types';
import { db } from './app';
import { fetchPage, friendly, str } from './helpers';

function toMaterial(id: string, d: DocumentData): TeachingMaterial {
  return {
    id,
    course: str(d.course, '기타'),
    semester: str(d.semester),
    title: str(d.title),
    description: str(d.description),
    url: str(d.url),
  };
}

export const firebaseTeachingService: TeachingService = {
  async list(options = {}) {
    try {
      // 학기 이름("2026-2학기")의 글자 순서로 최신 학기부터
      return await fetchPage(collection(db(), 'teaching'), [orderBy('semester', 'desc')], options, toMaterial);
    } catch (err) {
      return friendly(err);
    }
  },
};
