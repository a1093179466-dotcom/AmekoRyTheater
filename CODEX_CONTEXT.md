# CODEX_CONTEXT.md

## Project

Project name: AmekoRyTheater

Path:
D:\PersonalSite\ameko-ry-theater

Tech stack:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Prisma
* PostgreSQL
* Local file uploads under public/uploads
* Git / GitHub

Project positioning:

* Personal creator content website
* Admin publishes works and notices
* Visitors can browse free content
* Registered users can buy individual paid works
* Purchase unlocks hidden content and download information
* No monthly subscription model for now
* Do not use the wording “买断” in user-facing UI; use “付费作品”, “购买后解锁”, “购买后可查看付费内容”

## Current MVP Status

Completed:

* User registration
* Login / logout
* Session-based auth
* Admin / normal user roles
* Admin dashboard protection
* Work posts and notice posts
* Free and paid works
* Draft / published status
* Pinned posts
* Cover image upload
* Post creation
* Post editing
* Post deletion
* Gallery list
* Notice list
* Post detail page
* Comments
* Comment delete permissions
* Order system
* Purchase access system
* Simulated payment
* User profile
* User avatar upload
* Avatar display in profile and comments
* Dashboard overview
* Dashboard post management
* Dashboard upload page
* Dashboard edit page
* Dashboard orders page
* Dashboard purchases page
* Dashboard site settings page
* Toast / custom confirm system
* Intercepted login/register modal routes
* Site ticker
* Footer site settings
* YouTube / X / Pixiv configurable footer icon links
* Multi-image upload foundation
* Multi-image picker on create/edit forms
* Post detail image gallery / carousel

## Important Existing Files

Auth:

* lib/auth.ts
* lib/password.ts
* app/api/auth/register/route.ts
* app/api/auth/login/route.ts
* app/api/auth/logout/route.ts

Feedback:

* components/FeedbackProvider.tsx

Posts:

* app/api/posts/route.ts
* app/api/posts/[id]/route.ts
* app/dashboard/upload/page.tsx
* components/UploadPostForm.tsx
* app/dashboard/posts/page.tsx
* components/DashboardPostActions.tsx
* app/dashboard/posts/[id]/edit/page.tsx
* components/EditPostForm.tsx
* app/gallery/page.tsx
* app/gallery/[id]/page.tsx
* components/PostCard.tsx
* components/PostStatusBadges.tsx

Comments:

* components/CommentSection.tsx
* app/api/comments/route.ts
* app/api/comments/[id]/route.ts

Orders and purchases:

* components/PurchaseButton.tsx
* components/PayOrderButton.tsx
* components/CancelOrderButton.tsx
* app/api/orders/route.ts
* app/api/orders/[id]/pay/route.ts
* app/api/orders/[id]/cancel/route.ts
* app/dashboard/orders/page.tsx
* app/dashboard/purchases/page.tsx

Profile and avatar:

* app/profile/page.tsx
* components/AvatarUpload.tsx
* components/UserAvatar.tsx
* app/api/profile/avatar/route.ts

Site settings:

* prisma/schema.prisma
* lib/siteSetting.ts
* app/dashboard/settings/page.tsx
* components/SiteSettingsForm.tsx
* app/api/site-settings/route.ts
* components/SiteTicker.tsx
* components/Footer.tsx

Image uploads:

* lib/uploadFile.ts
* components/GalleryImagePicker.tsx
* components/PostImageGallery.tsx

## Data Models

Important Prisma models include:

* User
* Session
* Post
* Comment
* Purchase
* Order
* SiteSetting
* PostImage

Recent additions:

* User.avatarUrl
* SiteSetting fields for ticker and platform links
* Post.images relation
* PostImage model

PostImage:

* id
* postId
* imageUrl
* sortOrder
* createdAt
* relation to Post with onDelete Cascade

## Current Design Direction

Visual style:

* Dark theater style
* Black background
* Rose / amber / fuchsia glow
* Rounded cards
* Glass-like panels
* White primary buttons
* Rose hover accents

Use Tailwind CSS.
Prefer keeping style consistent with existing dashboard and frontend pages.

## Development Preferences

The project owner prefers:

* Chinese explanations
* Code with useful comments
* For simple text changes, give concise search/replace instructions
* For complex logic or multi-file edits, provide complete code
* Keep previous roadmap in mind and advance related features when appropriate
* Avoid over-explaining trivial steps
* Do not use native alert / window.confirm in client UI; use FeedbackProvider toast / confirm
* Do not expose internal IDs on frontend user pages unless necessary
* Backend/dashboard can show internal IDs
* Avoid “买断” wording in user-facing pages
* Preserve existing working logic unless the task requires changing it

## Commands

After Prisma schema changes:
npx prisma db push
npx prisma generate

When Prisma or Next cache behaves strangely:
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules.prisma
npx prisma db push
npx prisma generate
npm run dev

Git:
git status
git add .
git commit -m "message"
git push

The user has had GitHub push issues caused by proxy/VPN before. Turning off proxy solved it.

## Current Completed Step

The latest completed feature is:
Post detail image gallery / carousel.

Implemented:

* PostImage model
* galleryImages upload in post create/edit APIs
* GalleryImagePicker on upload/edit pages
* PostImageGallery on post detail page
* Mouse wheel switching and thumbnail switching

## Recommended Next Task

Next task:
Allow admin to delete existing gallery images from the edit page.

Expected implementation:

1. Add API route:
   app/api/post-images/[id]/route.ts

2. DELETE behavior:

   * Require admin
   * Find PostImage by id
   * Delete database record
   * Delete physical file from public/uploads/post-images if it starts with /uploads/
   * Return JSON success response

3. Update GalleryImagePicker:

   * Existing images should show a delete button
   * Deleting should call DELETE /api/post-images/[id]
   * Use FeedbackProvider toast / confirm
   * After success, remove image from local state or call router.refresh

4. Keep support for appending new images unchanged.

5. Test:

   * Create post with multiple gallery images
   * Edit post
   * Delete one old gallery image
   * Confirm it disappears
   * Refresh page and confirm it stays deleted
   * Confirm detail gallery updates
   * Confirm deleting a post still deletes remaining gallery image files

## Later Roadmap

After gallery image deletion:

1. Works likes and favorites
2. Profile “my favorites”
3. Comment replies
4. Notifications
5. Site settings phase 2:

   * homepage background image
   * hero/banner image
   * favicon upload or manual favicon replacement
6. Email system:

   * email verification
   * password reset
   * email notification preferences
7. Real payment integration:

   * EPAY order creation
   * notify_url callback
   * signature verification
   * providerTradeNo
   * paymentType
   * mark Order as PAID only after verified backend callback
8. Deployment:

   * production database
   * HTTPS
   * domain
   * persistent file storage
   * backup strategy

---

## Update Record: Delete Existing Gallery Images

本次完成：编辑页删除旧作品图

修改过的文件：

* app/api/post-images/[id]/route.ts
* components/GalleryImagePicker.tsx
* components/EditPostForm.tsx

新增的 API / 组件变更：

* 新增 DELETE /api/post-images/[id]
* 管理员可在编辑页删除已有作品图
* 删除时会移除 PostImage 数据库记录
* 删除时会清理 public/uploads/post-images 下对应本地文件
* GalleryImagePicker 旧图卡片增加删除按钮，并使用 FeedbackProvider confirm / toast
* EditPostForm 支持不更换封面时继续追加新作品图

测试结果：

* 已确认 DELETE API 要求管理员权限
* 已确认删除 PostImage 记录和本地 post-images 文件的逻辑存在
* 已确认编辑页旧作品图可触发删除并从本地列表移除
* 已确认作品详情页读取 post.images，刷新后不会再显示已删除图片
* 已确认删除整篇作品时会遍历剩余多图并清理本地文件
* 本次相关文件 eslint 通过

已知问题：暂无

推荐下一步：作品收藏系统第一轮

---

## Update Record: Post Favorite Toggle

本次完成：作品收藏系统第一轮

修改过的文件：

* prisma/schema.prisma
* app/api/favorites/route.ts
* app/gallery/[id]/page.tsx
* components/FavoriteButton.tsx
* CODEX_CONTEXT.md

新增的 Prisma 模型：

* Favorite
  * id
  * userId
  * postId
  * createdAt
  * user relation，onDelete Cascade
  * post relation，onDelete Cascade
  * @@unique([userId, postId])
  * @@index([userId])
  * @@index([postId])

新增的 API：

* POST /api/favorites
  * 登录用户收藏 WORK 作品
  * 重复收藏保持幂等，不报错
  * NOTICE 不允许收藏
* DELETE /api/favorites
  * 登录用户取消收藏
  * 取消不存在的收藏保持幂等，不报错

新增的组件：

* components/FavoriteButton.tsx
  * 显示已收藏 / 未收藏状态
  * 显示收藏数
  * 点击切换收藏状态
  * loading 状态防止重复点击
  * 使用 FeedbackProvider toast，不使用 alert/window.confirm

测试结果：

* npx prisma db push 成功
* npx prisma generate 成功
* npx prisma validate 通过
* 本次相关文件 eslint 通过
* 未登录 POST /api/favorites 返回 401 和友好 JSON，不会 500
* 收藏 API 使用 upsert / deleteMany，重复收藏和取消不存在收藏均保持幂等
* 作品详情页只在 WORK 内容显示 FavoriteButton，NOTICE 公告不显示
* 发现已有 Next dev server 在 localhost:3000 运行；未强制停止现有服务

已知问题：

* 全量 npx tsc --noEmit 仍被既有旧问题阻塞：app/api/posts/[id]/edit/page.tsx:77 传给 EditPostForm 的 post 字段不完整。该问题不是本次收藏系统引入。

推荐下一步：个人中心“我的收藏”列表

---

## Update Record: Profile Favorite List

本次完成：
* 修复 app/api/posts/[id]/edit/page.tsx 传给 EditPostForm 的 post 字段不完整导致的 TypeScript 阻塞
* 新增个人中心“我的收藏”列表页面
* 在个人中心侧栏新增“我的收藏”入口

修改过的文件：
* app/api/posts/[id]/edit/page.tsx
* app/profile/page.tsx
* app/profile/favorites/page.tsx
* CODEX_CONTEXT.md

新增页面：
* app/profile/favorites/page.tsx

测试结果：
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run lint -- app/profile/favorites/page.tsx app/profile/page.tsx app/api/posts/[id]/edit/page.tsx 通过
* npm run dev 检查时发现同项目已有 Next dev server 记录；未登录访问 /profile/favorites 返回 307 登录跳转，没有 500
* 使用本地有效登录态访问 /profile/favorites 返回 200
* 源码检查确认 /profile 页面已增加“我的收藏”入口
* 收藏列表按 Favorite.createdAt desc 查询当前用户收藏的 WORK 作品

已知问题：
* 暂无

推荐下一步：作品点赞系统第一轮

---

## Update Record: Post Like Toggle

本次完成：作品点赞系统第一轮

修改过的文件：
* prisma/schema.prisma
* app/api/likes/route.ts
* app/gallery/[id]/page.tsx
* components/LikeButton.tsx
* CODEX_CONTEXT.md

新增的 Prisma 模型：
* Like
  * id
  * userId
  * postId
  * createdAt
  * user relation，onDelete Cascade
  * post relation，onDelete Cascade
  * @@unique([userId, postId])
  * @@index([userId])
  * @@index([postId])

新增的 API：
* POST /api/likes
  * 登录用户点赞 WORK 作品
  * 重复点赞保持幂等，不报错
  * NOTICE 公告不允许点赞
  * 返回 liked 和 likeCount
* DELETE /api/likes
  * 登录用户取消点赞
  * 取消不存在的点赞保持幂等，不报错
  * 返回 liked 和 likeCount

新增的组件：
* components/LikeButton.tsx
  * 显示点赞 / 已点赞状态
  * 显示点赞数
  * 点击切换点赞状态
  * loading 状态防止重复点击
  * 使用 FeedbackProvider toast，不使用 alert/window.confirm

测试结果：
* npx prisma db push 成功
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run lint -- app/api/likes/route.ts components/LikeButton.tsx app/gallery/[id]/page.tsx 通过
* npm run dev 成功启动，/gallery 返回 200
* 未登录访问作品详情页 /gallery/6 返回 200
* 未登录 POST /api/likes 返回 401 和“请先登录后再点赞”，没有 500
* 登录用户 POST /api/likes 可以点赞，返回 liked=true 和最新 likeCount
* 重复 POST /api/likes 返回 200，不重复增加点赞
* DELETE /api/likes 可以取消点赞，返回 liked=false 和最新 likeCount
* 重复 DELETE /api/likes 返回 200，不导致 500
* 公告页 /gallery/13 返回 200，POST /api/likes 对 NOTICE 返回 400
* 测试结束后已恢复测试前点赞状态
* 收藏 API 回归通过，个人中心“我的收藏”页面 /profile/favorites 返回 200

已知问题：
* 暂无

推荐下一步：评论回复系统第一轮

---

## Update Record: Comment Replies

本次完成：评论回复系统第一轮

修改过的文件：
* prisma/schema.prisma
* app/api/comments/route.ts
* app/api/comments/[id]/route.ts
* app/gallery/[id]/page.tsx
* components/CommentSection.tsx
* CODEX_CONTEXT.md

修改的 Prisma 模型：
* Comment
  * 新增 parentId Int?
  * 新增 parent Comment? 自关联
  * 新增 replies Comment[] 自关联
  * 新增 @@index([parentId])
  * 旧一级评论 parentId 默认为 null

修改的 API：
* POST /api/comments
  * 支持创建一级评论
  * 支持通过 parentId 创建一级回复
  * 校验父评论存在且属于同一个 postId
  * 如果 parentId 指向一条回复，会归到原始一级评论下
  * 未登录用户不能评论或回复
* DELETE /api/comments/[id]
  * 管理员可以删除任意评论或回复
  * 普通用户只能删除自己的评论或回复
  * 删除一级评论时会同时删除其 replies
  * 删除回复时只删除该回复

修改的组件：
* components/CommentSection.tsx
  * 一级评论下显示回复列表
  * 评论和回复都显示头像、用户名、时间、内容、回复按钮
  * 有权限时显示删除按钮
  * 点击回复后在对应评论/回复下方显示回复输入框
  * 回复提交成功后立即加入对应一级评论的 replies
  * 使用 FeedbackProvider toast / confirm，不使用 alert/window.confirm

测试结果：
* npx prisma db push 成功
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run lint -- app/api/comments/route.ts app/api/comments/[id]/route.ts app/gallery/[id]/page.tsx components/CommentSection.tsx prisma/schema.prisma 通过；prisma/schema.prisma 被 ESLint 忽略并产生 warning，无错误
* npm run dev 成功启动，/gallery 返回 200
* 未登录访问作品详情页 /gallery/6 返回 200
* 登录用户可以发表一级评论，返回 parentId=null
* 未登录用户回复返回 401，不会 500
* 登录用户可以回复一级评论，回复 parentId 指向一级评论
* 刷新 /gallery/6 后可看到回复内容
* 普通用户删除别人的回复返回 403
* 普通用户可以删除自己的回复
* 管理员可以删除任意回复
* 管理员可以删除任意一级评论
* 删除一级评论时，其回复会被删除
* 收藏 API 回归通过
* 点赞 API 回归通过
* 个人中心“我的收藏”页面 /profile/favorites 返回 200
* 测试创建的临时用户、会话、评论和回复已清理

已知问题：
* 暂无

推荐下一步：站内通知系统第一轮，或者站点设置第二阶段

---

## Update Record: Notifications Phase 1

本次完成：站内通知系统第一轮

修改过的文件：
* prisma/schema.prisma
* app/api/comments/route.ts
* app/api/notifications/[id]/read/route.ts
* app/api/notifications/read-all/route.ts
* app/profile/notifications/page.tsx
* app/profile/page.tsx
* components/NotificationList.tsx
* CODEX_CONTEXT.md

新增的 Prisma 模型：
* Notification
  * id
  * userId
  * type
  * title
  * content
  * linkUrl
  * isRead
  * createdAt
  * user relation，onDelete Cascade
  * @@index([userId])
  * @@index([isRead])
  * @@index([createdAt])

新增的 API：
* POST /api/notifications/[id]/read
  * 登录用户标记自己的单条通知为已读
  * 不能标记别人的通知
* POST /api/notifications/read-all
  * 登录用户标记自己的全部未读通知为已读
  * 返回 updatedCount

修改的 API：
* POST /api/comments
  * 创建回复成功后，为被回复评论作者创建 COMMENT_REPLY 通知
  * 回复者回复自己时不创建通知
  * 父评论没有 userId 时不创建通知
  * 通知创建失败只打印错误，不影响回复成功

新增/修改的页面和组件：
* app/profile/notifications/page.tsx
  * 登录后可访问“我的通知”
  * 按 createdAt desc 显示通知列表
  * 显示标题、内容、时间、已读/未读状态
  * 提供返回个人中心入口
* components/NotificationList.tsx
  * 支持单条标记已读
  * 支持全部标记已读
  * 使用 FeedbackProvider toast，不使用 alert/window.confirm
* app/profile/page.tsx
  * 个人中心增加“我的通知”入口
  * 显示未读数量

测试结果：
* npx prisma db push 成功
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run lint -- app/api/comments/route.ts app/api/notifications/[id]/read/route.ts app/api/notifications/read-all/route.ts app/profile/notifications/page.tsx components/NotificationList.tsx app/profile/page.tsx prisma/schema.prisma 通过；prisma/schema.prisma 被 ESLint 忽略并产生 warning，无错误
* npm run dev 成功启动，/gallery 返回 200
* 未登录访问 /profile/notifications 返回 307 登录跳转，没有 500
* 用户 A 创建一级评论成功
* 用户 B 回复用户 A 的评论后，为用户 A 创建 COMMENT_REPLY 通知
* 通知 linkUrl 指向 /gallery/{postId}
* 用户 B 回复自己的评论时，不生成通知
* 用户 A 访问 /profile/notifications 返回 200，页面响应包含通知标题和内容
* 通知 linkUrl 对应作品详情页返回 200
* 普通用户不能标记别人的通知，返回 403
* 单条标记已读成功，并持久化 isRead=true
* 全部标记已读成功，未读数归零
* 评论回复、收藏 API、点赞 API 回归通过
* 测试创建的临时用户、会话、评论和通知已清理

已知问题：
* 暂无

推荐下一步：互动系统收尾检查，或站点设置第二阶段
