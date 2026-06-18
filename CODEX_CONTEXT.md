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
* Delete existing gallery images from edit page
* Comment replies
* Post likes
* Post favorites
* Profile “my favorites” page
* Notification center
* Comment reply notifications
* Admin notifications for comments, likes, favorites, and purchases
* Navbar user avatar menu
* Navbar unread notification badge
* Click notification to mark read and navigate
* Card-level like / favorite controls
* About page powered by site settings
* Homepage background image and Hero image configurable from site settings

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

Interactions:

* components/LikeButton.tsx
* components/FavoriteButton.tsx
* app/api/likes/route.ts
* app/api/favorites/route.ts
* app/profile/favorites/page.tsx
* app/profile/notifications/page.tsx
* components/NotificationList.tsx
* lib/notifications.ts

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
* Favorite
* Like
* Notification

Recent additions:

* User.avatarUrl
* SiteSetting fields for ticker and platform links
* Post.images relation
* PostImage model
* Comment.parentId self relation for first-level replies
* Favorite model for post collections
* Like model for post likes
* Notification model for in-site notifications
* SiteSetting homeBackgroundImage / homeHeroImage for homepage visual assets

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
Site settings visual assets phase 1.

Implemented:

* SiteSetting homeBackgroundImage and homeHeroImage fields
* Dashboard site settings can save homepage background and Hero image URLs
* Dashboard site settings can upload homepage background and Hero image files
* Dashboard site settings can clear homepage background and Hero image values
* Site settings API supports multipart image uploads under public/uploads/site-settings
* Homepage reads configured visual assets with dark overlay and responsive Hero visual
* Interaction system cleanup remains completed, including comment replies, notifications, likes, favorites, card interactions, avatar menu, and admin interaction notifications

## Recommended Next Task

Next task:
Payment system preflight cleanup, or favicon / site icon handling.

Suggested payment preflight cleanup:

1. Review simulated payment boundaries
2. Prepare EPAY callback route shape
3. Confirm order status transitions and idempotency
4. Keep Purchase creation behind verified payment success

Suggested favicon / site icon handling:

1. Confirm current app icon / favicon files
2. Decide manual replacement or later upload flow
3. Document cache behavior and recommended image formats

## Later Roadmap

After site settings visual assets phase 1:

1. Payment system preflight and real payment integration prep
2. Favicon / site icon handling

   * manual replacement first, upload flow can be delayed
3. Email system:

   * email verification
   * password reset
   * email notification preferences
4. Real payment integration:

   * EPAY order creation
   * notify_url callback
   * signature verification
   * providerTradeNo
   * paymentType
   * mark Order as PAID only after verified backend callback
5. Deployment:

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

---

## Update Record: Navbar User Menu and Admin Interaction Notifications

本次完成：
* 导航栏登录态从文字按钮调整为用户头像菜单
* 头像菜单显示当前用户名 / 邮箱、个人中心、我的通知、退出登录
* 导航栏头像旁显示未读通知数字，超过 99 显示 99+
* 通知页标记已读 / 全部已读成功后会 router.refresh，刷新导航栏未读数
* 管理员会收到作品点赞、收藏、模拟支付成功通知
* 点赞 / 收藏重复 POST 不重复创建管理员通知
* 支付通知只在订单从未支付进入支付成功流程时创建

修改过的文件：
* components/Navbar.tsx
* components/UserNavMenu.tsx
* components/NotificationList.tsx
* app/profile/page.tsx
* app/api/likes/route.ts
* app/api/favorites/route.ts
* app/api/orders/[id]/pay/route.ts
* lib/notifications.ts
* CODEX_CONTEXT.md

新增或修改的组件：
* 新增 components/UserNavMenu.tsx
  * 使用 UserAvatar 显示当前用户头像或首字母占位
  * hover / focus 时显示暗色剧场风下拉菜单
  * 退出登录调用 /api/auth/logout，并使用 FeedbackProvider toast
* 修改 components/Navbar.tsx
  * 服务端查询当前用户未读通知数
  * 未登录时继续显示 AuthNavButtons，保留登录 / 注册拦截弹窗入口
* 修改 components/NotificationList.tsx
  * 标记已读 / 全部已读成功后刷新服务端数据

新增或修改的 API / 通知逻辑：
* 新增 lib/notifications.ts
  * createAdminNotifications 查询所有 ADMIN 用户
  * 自动过滤操作人自己
  * 通知创建失败只 console.error，不影响主流程
* 修改 POST /api/likes
  * 新点赞成功时创建 POST_LIKED 管理员通知
  * 重复点赞保持幂等且不重复通知
* 修改 POST /api/favorites
  * 新收藏成功时创建 POST_FAVORITED 管理员通知
  * 重复收藏保持幂等且不重复通知
* 修改 POST /api/orders/[id]/pay
  * 模拟支付成功并创建购买权限后创建 POST_PURCHASED 管理员通知
  * 已支付订单重复支付返回成功但不重复通知

测试结果：
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run lint -- components/Navbar.tsx components/UserNavMenu.tsx components/NotificationList.tsx app/api/likes/route.ts app/api/favorites/route.ts app/api/orders/[id]/pay/route.ts lib/notifications.ts app/profile/page.tsx 通过
* npm run dev 成功启动，/gallery 返回 200
* 未登录首页响应包含登录 / 注册入口
* 登录后首页响应包含当前用户信息、/profile、/profile/notifications 和未读通知数字
* POST /api/auth/logout 成功，Session 被删除
* 普通用户不能标记别人的通知，返回 403
* 单条标记已读成功，未读数归零
* 全部标记已读成功，未读数归零
* 用户点赞作品后，所有非本人 ADMIN 用户收到 POST_LIKED 通知
* 用户重复点赞同一作品，不重复通知管理员
* 用户收藏作品后，所有非本人 ADMIN 用户收到 POST_FAVORITED 通知
* 用户重复收藏同一作品，不重复通知管理员
* 用户模拟支付成功后，所有非本人 ADMIN 用户收到 POST_PURCHASED 通知
* 已支付订单重复调用支付接口，不重复通知管理员
* 评论回复通知回归通过
* 测试创建的临时用户、会话、作品、订单、购买权限、评论、互动记录和通知已清理

已知问题：
* 暂无

推荐下一步：互动系统收尾检查

---

## Update Record: Interaction System Cleanup

本次完成：互动系统收尾检查

检查过的功能：
* 导航栏未登录 / 已登录状态、头像菜单、通知入口和未读数字
* 通知中心、单条已读、全部已读、通知权限校验
* COMMENT_REPLY / POST_COMMENTED / POST_LIKED / POST_FAVORITED / POST_PURCHASED 通知
* 作品详情页、首页卡片、作品列表卡片、我的收藏卡片的点赞 / 收藏入口
* 未登录点赞 / 收藏返回友好错误，不会 500
* NOTICE 公告不显示点赞 / 收藏入口
* 我的收藏新增 / 取消后的列表表现
* 一级评论、评论回复、评论 / 回复删除权限、删除一级评论级联清理回复
* /about 页面读取 SiteSetting 中的 aboutText / contactEmail / external link
* ROADMAP.md 与 CODEX_CONTEXT.md 顶部状态同步
* 全局文案扫描：alert/window.confirm、买断、TODO / 开发痕迹

修复过的问题：
* 个人中心侧边头像改为复用 UserAvatar，上传头像后显示更一致
* FavoriteButton 增加 try/catch/finally，网络异常时不会卡在 loading
* 关于页空状态文案去掉管理后台说明，避免普通访客看到管理提示
* 我的通知页面说明更新为评论回复、作品互动和购买等通知
* 旧 CancelOrderButton / DeletePostButton / LogoutButton / UploadPostForm / 登录页 / 注册页中的 alert/window.confirm 已替换为 FeedbackProvider toast / confirm
* UploadPostForm 封面预览 URL 改为 useMemo 生成、effect 只负责释放，修复 React hooks lint 错误
* 后台内容管理文案从“删除测试内容”改为“删除内容”
* PostCard 默认封面注释从“测试图”改为“默认图”

修改过的文件：
* CODEX_CONTEXT.md
* ROADMAP.md
* app/about/page.tsx
* app/dashboard/posts/page.tsx
* app/login/page.tsx
* app/profile/notifications/page.tsx
* app/profile/page.tsx
* app/register/page.tsx
* components/CancelOrderButton.tsx
* components/DeletePostButton.tsx
* components/FavoriteButton.tsx
* components/LogoutButton.tsx
* components/PostCard.tsx
* components/UploadPostForm.tsx

测试结果：
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run build 通过
* 相关文件 npm run lint 通过；仅 UploadPostForm 本地预览图使用 img 有性能 warning，无错误
* 生产服务 HTTP 回归通过：未登录 / 登录导航、通知已读权限、全部已读、点赞 / 收藏、NOTICE 禁止互动、我的收藏新增 / 移除、评论回复通知、一级评论管理员通知、评论删除权限、删除一级评论级联清理回复、模拟支付管理员通知、关于页站点设置展示
* 全局扫描 app/components/lib/prisma 未发现 alert/window.confirm
* 全局扫描 app/components/lib/prisma 未发现用户可见“买断”文案
* 开发痕迹扫描仅剩后台订单页“内部 ID”，属于后台排查信息，按项目规则保留

已知问题：
* 隐藏后台启动 dev server 在当前环境偶发不稳定；本次使用 production start HTTP 回归、TypeScript、lint 和 build 覆盖
* UploadPostForm 的本地封面预览仍使用 img，lint 给出性能 warning；这是本地 blob 预览，不影响构建

推荐下一步：站点设置第二阶段

---

## Update Record: Card Interactions, About Page, and Comment Admin Notifications

本次完成：
* 首页 / 作品列表 / 我的收藏里的作品卡片增加点赞和收藏入口
* 作品详情页“内容信息”里的点赞 / 收藏改为小型图标按钮
* 点赞使用大拇指图标，收藏使用星星图标，并显示当前数量
* 关于页接入站点设置里的关于内容、联系邮箱和外部链接
* 管理员登录时可从关于页进入后台站点设置编辑关于内容
* 用户直接评论帖子时，管理员会收到 POST_COMMENTED 站内通知

修改过的文件：
* app/page.tsx
* app/gallery/page.tsx
* app/gallery/[id]/page.tsx
* app/profile/favorites/page.tsx
* app/about/page.tsx
* app/api/comments/route.ts
* components/PostCard.tsx
* components/LikeButton.tsx
* components/FavoriteButton.tsx
* components/SiteSettingsForm.tsx
* CODEX_CONTEXT.md

新增或修改的交互：
* PostCard 支持展示点赞数 / 收藏数 / 当前用户状态
* LikeButton / FavoriteButton 改为紧凑图标按钮，可复用于卡片和详情侧栏
* 未登录用户点击卡片上的点赞 / 收藏仍使用 FeedbackProvider toast 提示登录
* NOTICE 公告卡片不显示点赞 / 收藏按钮

新增或修改的通知逻辑：
* POST /api/comments 创建一级评论成功后，会给所有非本人 ADMIN 用户发送 POST_COMMENTED 通知
* 回复评论的 COMMENT_REPLY 通知逻辑保持不变
* 通知创建失败不影响评论主流程

测试结果：
* npx tsc --noEmit 通过
* npm run lint -- app/about/page.tsx app/api/comments/route.ts app/gallery/[id]/page.tsx app/gallery/page.tsx app/page.tsx app/profile/favorites/page.tsx components/FavoriteButton.tsx components/LikeButton.tsx components/PostCard.tsx components/SiteSettingsForm.tsx 通过
* npm run build 通过，/、/about、/gallery、/gallery/[id]、/profile/favorites 等页面编译成功
* npm run dev 前台启动成功并显示 Ready
* 本次相关文件未新增 alert/window.confirm
* 本次相关文件未新增用户可见“买断”文案

已知问题：
* 当前环境隐藏后台启动 dev server 不稳定，实际页面请求验证改由 npm run build 和前台 npm run dev Ready 覆盖

推荐下一步：互动系统收尾检查

---

## Update Record: Navbar Menu and Notification Read Interaction Fix

本次完成：
* 修复导航栏头像下拉菜单 hover 间隙导致的闪退问题
* 头像菜单在鼠标停留于头像或下拉框内时保持显示，离开后再关闭
* 通知列表改为点击通知卡片自动标记已读并进入对应内容
* 移除单条通知的手动“标记已读”按钮，保留“全部标记已读”批量工具

修改过的文件：
* components/UserNavMenu.tsx
* components/NotificationList.tsx
* CODEX_CONTEXT.md

测试结果：
* npx tsc --noEmit 通过
* npm run lint -- components/UserNavMenu.tsx components/NotificationList.tsx 通过
* npm run dev 成功启动，/gallery 返回 200
* 登录态首页响应包含用户信息、未读通知数字和通知入口
* /profile/notifications 响应包含通知目标链接
* 通知单条手动“标记已读”按钮已不再显示
* POST /api/notifications/[id]/read 成功后未读数归零
* 测试创建的临时用户、会话和通知已清理

已知问题：
* 当前浏览器插件被沙盒拒绝启动，未能做可视化鼠标轨迹验证；本次已通过代码结构、类型检查、lint 和本地页面/API 验证覆盖主要行为

推荐下一步：互动系统收尾检查

---

## Update Record: Site Settings Visual Assets Phase 1

本次完成：站点设置第二阶段第一轮

修改过的文件：
* prisma/schema.prisma
* app/api/site-settings/route.ts
* app/dashboard/settings/page.tsx
* components/SiteSettingsForm.tsx
* app/page.tsx
* CODEX_CONTEXT.md
* ROADMAP.md

新增或修改的 SiteSetting 字段：
* homeBackgroundImage String @default("")
* homeHeroImage String @default("")

新增或修改的上传逻辑：
* PATCH /api/site-settings 支持 multipart/form-data
* 支持 homeBackgroundImageFile 和 homeHeroImageFile
* 上传图片保存到 public/uploads/site-settings
* 返回 /uploads/site-settings/... 浏览器可访问路径
* 未上传新图时保留已有值
* 传空字符串时清空对应图片配置
* 上传失败返回友好 JSON，不使用 alert/window.confirm

修改的页面 / 组件：
* 后台站点设置页新增“首页视觉资源”区域
* SiteSettingsForm 支持背景图 / Hero 图 URL 输入、上传、预览和清空
* 首页读取 homeBackgroundImage 作为带黑色遮罩的背景图
* 首页读取 homeHeroImage 作为响应式 Hero 主视觉图

测试结果：
* npx prisma db push 成功
* npx prisma generate 成功
* npx tsc --noEmit 通过
* npm run build 通过
* 生产服务 HTTP 验证通过：背景图 URL 保存、Hero 图 URL 保存、背景图文件上传、Hero 图文件上传、清空配置、首页读取展示
* 测试上传图片已清理，git status 未出现上传图片文件
* 全局扫描 app/components/lib/prisma 未发现 alert/window.confirm 或用户可见“买断”文案

已知问题：
* 当前功能暂无已知问题
* 额外执行 npm run lint 时仍被旧的 components/PayOrderButton.tsx 倒计时 effect lint 问题阻塞；该问题不是本轮站点设置改动引入，本轮未改无关文件

推荐下一步：支付系统前置整理，或 favicon / 站点图标处理
