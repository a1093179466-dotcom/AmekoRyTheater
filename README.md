# AmekoRyTheater

AmekoRyTheater 是一个个人创作者内容站项目，用于发布个人作品、公告和付费内容。

项目当前定位是：

- 个人创作者主页
- 免费作品展示
- 单篇付费作品
- 登录用户评论
- 管理员后台发布和管理内容
- 用户购买后永久解锁对应作品

当前项目对标方向是个人内容发布站，而不是传统电商商城。

---

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Git / GitHub

---

## 当前已完成功能

### 用户系统

- 用户注册
- 用户登录
- Session 登录状态
- 退出登录
- 导航栏显示当前登录用户
- 管理员角色
- 普通用户角色
- 个人中心页面

### 内容系统

- 作品帖
- 公告帖
- 免费作品
- 付费作品
- 草稿状态
- 置顶状态
- 封面图上传
- 帖子详情页
- 作品列表页
- 公告列表页

### 后台管理

- 后台权限保护
- 管理员发布帖子
- 管理员编辑帖子
- 管理员删除帖子
- 后台帖子列表
- 后台购买记录查看

### 评论系统

- 登录用户发表评论
- 评论绑定真实用户
- 评论持久化保存
- 用户可删除自己的评论
- 管理员可删除所有评论
- 游客不可评论

### 购买系统

- 单篇作品付费制
- 用户购买后生成 Purchase 记录
- 已购买用户可查看付费隐藏内容
- 未购买用户不可查看付费隐藏内容
- 管理员永远可以查看全部内容
- 个人中心显示已购买作品

---

## 项目目录说明

```text
app/
  api/
    auth/
      login/
      logout/
      register/
    comments/
    posts/
    purchases/
  dashboard/
  gallery/
  login/
  notices/
  profile/
  register/

components/
  页面组件和可复用 UI 组件

lib/
  auth.ts        登录状态与权限判断
  password.ts    密码哈希与校验
  prisma.ts      Prisma 数据库客户端

prisma/
  schema.prisma  数据库模型定义
  seed.ts        测试数据初始化脚本

public/
  images/        静态测试图片
  uploads/       本地上传封面图

### 安装依赖
npm install
copy .env.example .env
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/amekorytheater"

npx prisma db push
npx prisma generate
npm run dev
if (Test-Path .next) {
  Remove-Item -Recurse -Force .next
}
if (Test-Path node_modules\.prisma) {
  Remove-Item -Recurse -Force node_modules\.prisma
}

npx prisma generate
