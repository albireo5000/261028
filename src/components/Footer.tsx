// 바닥글: 사이트 이름과 연락처
import { site } from '../config/site';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-600 sm:px-6">
        <p>
          © {new Date().getFullYear()} {site.name} · 문의{' '}
          <a href={`mailto:${site.contactEmail}`} className="underline hover:text-navy-800">
            {site.contactEmail}
          </a>
        </p>
      </div>
    </footer>
  );
}
