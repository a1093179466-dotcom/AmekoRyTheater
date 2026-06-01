type PostStatusBadgesProps = {
  type: string;
  isPaid: boolean;
  isPinned: boolean;

  // 草稿状态默认不展示。
  // 前台卡片一般不需要显示草稿，因为草稿不会出现在前台。
  // 后台和详情页可以选择显示。
  isPublished?: boolean;
  showPublishedStatus?: boolean;

  // 价格不是每个状态都必须显示。
  // 付费作品有价格，免费作品和公告不需要。
  price?: number;
};

/**
 * 帖子状态标签组件。
 *
 * 负责统一展示：
 * - 作品 / 公告
 * - 置顶
 * - 免费 / 付费
 * - 草稿
 *
 * 为什么要单独拆出来？
 * 因为这些状态会在首页、详情页、后台列表等多个地方重复出现。
 * 抽成组件后，以后只需要改这里一处。
 */
export default function PostStatusBadges({
  type,
  isPaid,
  isPinned,
  isPublished = true,
  showPublishedStatus = false,
  price,
}: PostStatusBadgesProps) {
  const isNotice = type === "NOTICE";

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="bg-zinc-800 px-2 py-1 rounded-full text-zinc-300">
        {isNotice ? "公告" : "作品"}
      </span>

      {isPinned && (
        <span className="bg-yellow-900/40 px-2 py-1 rounded-full text-yellow-300">
          置顶
        </span>
      )}

      {!isNotice && (
        isPaid ? (
          <span className="bg-red-900/40 px-2 py-1 rounded-full text-red-300">
            付费{price ? ` ¥${price}` : ""}
          </span>
        ) : (
          <span className="bg-green-900/40 px-2 py-1 rounded-full text-green-300">
            免费
          </span>
        )
      )}

      {showPublishedStatus && !isPublished && (
        <span className="bg-red-900/40 px-2 py-1 rounded-full text-red-300">
          草稿
        </span>
      )}
    </div>
  );
}