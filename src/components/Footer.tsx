// 바닥글: 사이트 이름과 연락처
import { site } from '../config/site';

export default function Footer() {
  return (
    <footer className="on-dark bg-navy-900 text-navy-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-medium text-white">{site.name}</p>
        <p>
          문의{' '}
          <a href={`mailto:${site.contactEmail}`} className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
            {site.contactEmail}
          </a>
          <span className="mx-2" aria-hidden="true">·</span>© {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
