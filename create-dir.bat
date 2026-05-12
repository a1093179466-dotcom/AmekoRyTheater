@echo off

echo Creating Next.js pages...

:: 创建页面文件夹
mkdir app\about
mkdir app\gallery
mkdir app\login
mkdir app\register
mkdir app\dashboard

:: 创建 page.tsx 文件

echo export default function AboutPage() { ^> app\about\page.tsx
echo   return ( ^>> app\about\page.tsx
echo     ^<main^> ^>> app\about\page.tsx
echo       ^<h1^>关于页面^</h1^> ^>> app\about\page.tsx
echo     ^</main^> ^>> app\about\page.tsx
echo   ); ^>> app\about\page.tsx
echo } ^>> app\about\page.tsx


echo export default function GalleryPage() { ^> app\gallery\page.tsx
echo   return ( ^>> app\gallery\page.tsx
echo     ^<main^> ^>> app\gallery\page.tsx
echo       ^<h1^>作品展示^</h1^> ^>> app\gallery\page.tsx
echo     ^</main^> ^>> app\gallery\page.tsx
echo   ); ^>> app\gallery\page.tsx
echo } ^>> app\gallery\page.tsx


echo export default function LoginPage() { ^> app\login\page.tsx
echo   return ( ^>> app\login\page.tsx
echo     ^<main^> ^>> app\login\page.tsx
echo       ^<h1^>登录页面^</h1^> ^>> app\login\page.tsx
echo     ^</main^> ^>> app\login\page.tsx
echo   ); ^>> app\login\page.tsx
echo } ^>> app\login\page.tsx


echo export default function RegisterPage() { ^> app\register\page.tsx
echo   return ( ^>> app\register\page.tsx
echo     ^<main^> ^>> app\register\page.tsx
echo       ^<h1^>注册页面^</h1^> ^>> app\register\page.tsx
echo     ^</main^> ^>> app\register\page.tsx
echo   ); ^>> app\register\page.tsx
echo } ^>> app\register\page.tsx


echo export default function DashboardPage() { ^> app\dashboard\page.tsx
echo   return ( ^>> app\dashboard\page.tsx
echo     ^<main^> ^>> app\dashboard\page.tsx
echo       ^<h1^>后台管理^</h1^> ^>> app\dashboard\page.tsx
echo     ^</main^> ^>> app\dashboard\page.tsx
echo   ); ^>> app\dashboard\page.tsx
echo } ^>> app\dashboard\page.tsx

echo Done!
pause