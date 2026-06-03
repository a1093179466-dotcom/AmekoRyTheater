/**
 * 网站底部信息区。
 *
 * 后续可以把这里替换成：
 * - 邮箱
 * - X / Pixiv / Fanbox / 爱发电等平台链接
 * - 购买须知
 * - 版权说明
 */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black px-6 py-12 text-zinc-400">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">
            AmekoRyTheater
          </h2>
          <p className="leading-7">
            这里是个人作品发布、公告通知与付费内容展示站。
            当前仍处于开发阶段，后续会继续完善 UI、支付和部署。
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-white">
            站内导航
          </h3>

          <div className="flex flex-col gap-2">
            <a href="/" className="hover:text-white transition">
              首页
            </a>
            <a href="/gallery" className="hover:text-white transition">
              作品
            </a>
            <a href="/notices" className="hover:text-white transition">
              公告
            </a>
            <a href="/profile" className="hover:text-white transition">
              个人中心
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-bold text-white">
            联系与平台
          </h3>

          <div className="flex flex-col gap-2">
            <p>邮箱：待补充</p>
            <p>其他平台作品：待补充</p>
            <p>购买说明：待补充</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl text-sm text-zinc-600">
        © AmekoRyTheater. All rights reserved.
      </div>
    </footer>
  );
}