// 토론 글 목록의 한 줄
import { Link } from 'react-router-dom';
import type { DiscussionPost } from '../services';
import { formatDate } from './format';

export default function PostListItem({ post }: { post: DiscussionPost }) {
  return (
    <li className="border-b border-navy-100 py-4 last:border-b-0">
      <Link to={`/discussion/${post.id}`} className="text-lg font-medium text-navy-900 hover:text-navy-700 hover:underline hover:underline-offset-4">
        {post.title}
      </Link>
      <p className="mt-1 text-sm text-gray-600">
        {post.authorName} · {formatDate(post.createdAt)} · 댓글 {post.commentCount}
      </p>
    </li>
  );
}
