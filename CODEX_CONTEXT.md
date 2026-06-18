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
