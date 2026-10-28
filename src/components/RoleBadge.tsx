// 역할 표시 배지 (교수 / 회원 / 승인 대기)
import type { Role } from '../services';

const labels: Record<Role, string> = {
  guest: '비회원',
  pending: '승인 대기',
  member: '회원',
  admin: '교수',
};

// 흰 바탕(로그인 화면)과 남색 바탕(상단 바) 모두에서 잘 보이는 색
const colors: Record<Role, string> = {
  guest: 'bg-white text-navy-700 ring-1 ring-inset ring-navy-200',
  pending: 'bg-white text-navy-600 ring-1 ring-inset ring-navy-300',
  member: 'bg-navy-100 text-navy-900',
  admin: 'bg-white text-navy-900 font-bold',
};

export default function RoleBadge({ role }: { role: Role }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role]}`}>{labels[role]}</span>;
}
