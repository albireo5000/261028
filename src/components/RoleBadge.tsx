// 역할 표시 배지 (교수 / 회원 / 승인 대기)
import type { Role } from '../services';

const labels: Record<Role, string> = {
  guest: '비회원',
  pending: '승인 대기',
  member: '회원',
  admin: '교수',
};

const colors: Record<Role, string> = {
  guest: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-900',
  member: 'bg-navy-100 text-navy-800',
  admin: 'bg-navy-800 text-white',
};

export default function RoleBadge({ role }: { role: Role }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role]}`}>{labels[role]}</span>;
}
