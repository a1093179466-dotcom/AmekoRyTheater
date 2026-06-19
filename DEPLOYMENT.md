# DEPLOYMENT.md

本文档记录云电脑上的部署和自动更新流程。当前项目优先支持 Windows 环境，项目目录默认为：

```powershell
D:\PersonalSite\ameko-ry-theater
```

本流程只负责拉取 GitHub 最新代码、安装依赖、生成 Prisma Client、构建 Next.js，并重启网站进程。不要把 `.env.local`、数据库密码、Resend API Key 或任何密钥写进 Git。

## 推荐方案

当前项目没有固定进程管理方案。推荐组合：

* PM2：管理 `npm run start` 网站进程，负责重启。
* Windows 计划任务：定时运行 `scripts\deploy-update.ps1`，检查 GitHub 是否有新提交。

Next.js 当前版本支持用 Node.js server 部署：先 `npm run build`，再 `npm run start`。本项目的 `package.json` 已包含这两个脚本。

## 云电脑首次部署步骤

1. 安装基础环境：

```powershell
git --version
node --version
npm --version
```

建议使用 Node.js LTS，并确保 `git`、`node`、`npm` 可以在 PowerShell 里直接执行。

2. 克隆项目到固定目录：

```powershell
cd D:\PersonalSite
git clone https://github.com/a1093179466-dotcom/AmekoRyTheater.git ameko-ry-theater
cd D:\PersonalSite\ameko-ry-theater
```

如果目录已经存在，确认它是正确仓库：

```powershell
git remote -v
git status -sb
```

3. 手动创建 `.env.local`：

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

把里面的示例值改成云电脑真实配置，例如 `DATABASE_URL`、`SITE_URL`、`EMAIL_PROVIDER`、`RESEND_API_KEY`、`EMAIL_FROM`。`.env.local` 已被 `.gitignore` 忽略，不要提交。

4. 安装依赖并准备数据库：

```powershell
npm ci
npx prisma generate
npx prisma db push
```

当前项目还没有 Prisma migrations 目录，所以首次部署仍沿用 `prisma db push`。生产数据库执行前应先备份。

5. 构建并启动网站：

```powershell
npm run build
npm install -g pm2
pm2 start npm --name ameko-ry-theater -- run start
pm2 save
```

默认端口是 `3000`。启动后访问：

```powershell
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
pm2 status ameko-ry-theater
```

## 手动执行更新

在云电脑 PowerShell 中执行：

```powershell
cd D:\PersonalSite\ameko-ry-theater
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-update.ps1
```

脚本默认会：

1. 进入 `D:\PersonalSite\ameko-ry-theater`
2. 执行 `git fetch origin main`
3. 比较本地 `HEAD` 和 `origin/main`
4. 没有更新则写日志并退出
5. 有更新则执行 `git pull --ff-only origin main`
6. 如果 `package.json`、`package-lock.json` 或 `npm-shrinkwrap.json` 变化，则安装依赖
7. 执行 `npx prisma generate`
8. 执行 `npm run build`
9. 用 PM2 reload 或 start 网站进程
10. 写入部署日志

如果只是想测试拉取、依赖、Prisma 和 build，不想重启网站，可以执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-update.ps1 -RestartMode none
```

生产更新建议使用默认 PM2 重启模式。

## 配置定时检查更新

使用 Windows 计划任务创建一个定时任务，例如每 5 分钟检查一次。

建议配置：

* 名称：`AmekoRyTheater Deploy Update`
* 触发器：每天，重复间隔 5 分钟
* 操作程序：`powershell.exe`
* 参数：

```text
-ExecutionPolicy Bypass -File "D:\PersonalSite\ameko-ry-theater\scripts\deploy-update.ps1"
```

* 起始于：

```text
D:\PersonalSite\ameko-ry-theater
```

建议勾选：

* 不管用户是否登录都要运行
* 使用最高权限运行
* 如果任务已在运行，则不启动新实例

如果云电脑重启后需要自动恢复 PM2 进程，可以再建一个“开机时”计划任务：

* 操作程序：`pm2`
* 参数：`resurrect`

也可以用 NSSM 或 Windows Service 包装 `npm run start`，但本项目当前推荐 PM2，配置最轻。

## 查看日志

部署更新日志在：

```powershell
D:\PersonalSite\ameko-ry-theater\logs\deploy
```

按日期生成：

```text
deploy-update-yyyy-MM-dd.log
```

查看当天日志：

```powershell
Get-Content .\logs\deploy\deploy-update-$(Get-Date -Format "yyyy-MM-dd").log -Tail 120
```

查看网站进程日志：

```powershell
pm2 logs ameko-ry-theater --lines 100
pm2 status ameko-ry-theater
```

## 没有新提交时

脚本会在日志里记录：

```text
No updates found. Exiting without build or restart.
```

这时不会安装依赖、不会执行 build，也不会重启网站。

## 有新提交时

脚本会快进拉取 `origin/main`，然后继续执行依赖检查、Prisma generate、build 和 PM2 重启。

如果依赖文件没有变化，会跳过依赖安装：

```text
Dependency files did not change; skipping dependency install.
```

如果依赖文件变化，优先使用 `npm ci`，因为项目有 `package-lock.json`。

## 更新失败时

脚本使用失败即停止策略：

* `git pull --ff-only` 失败：不会继续 build 或重启。
* `npm ci` 失败：不会继续 Prisma、build 或重启。
* `npx prisma generate` 失败：不会 build 或重启。
* `npm run build` 失败：不会重启网站进程。
* PM2 不存在：build 完成后会失败并提示安装 PM2。

排查顺序：

```powershell
git status -sb
git log -1 --oneline
Get-Content .\logs\deploy\deploy-update-$(Get-Date -Format "yyyy-MM-dd").log -Tail 160
npx prisma generate
npm run build
pm2 status ameko-ry-theater
pm2 logs ameko-ry-theater --lines 100
```

如果需要回滚，先确认云电脑没有本地未保存改动：

```powershell
git status -sb
git log --oneline -5
```

内部云电脑紧急回滚可以选择一个已知可用提交：

```powershell
git reset --hard <known-good-commit>
npm ci
npx prisma generate
npm run build
pm2 reload ameko-ry-theater --update-env
```

这会丢弃当前工作区改动，只应在部署机器上确认安全后执行。共享仓库里的正式修复更推荐用新提交或 `git revert`。

## 确认网站已重启成功

1. PM2 状态正常：

```powershell
pm2 status ameko-ry-theater
```

2. 本机访问首页返回成功：

```powershell
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

3. 进程日志没有新的启动错误：

```powershell
pm2 logs ameko-ry-theater --lines 100
```

4. 页面上能看到新提交包含的文案或功能变化。
