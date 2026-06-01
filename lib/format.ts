/**
 * 把日期格式化成“日期”。
 *
 * 适合用于：
 * - 帖子发布时间
 * - 购买日期
 * - 列表卡片上的日期
 *
 * 示例：
 * 2026/05/14
 */
export function formatDate(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 把日期格式化成“日期 + 时间”。
 *
 * 适合用于：
 * - 评论时间
 * - 购买记录时间
 * - 后台管理记录时间
 *
 * 示例：
 * 2026/05/14 18:30
 */
export function formatDateTime(date: Date) {
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}