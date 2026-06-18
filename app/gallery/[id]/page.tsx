import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import PurchaseButton from "@/components/PurchaseButton";
import PostStatusBadges from "@/components/PostStatusBadges";
import PostImageGallery from "@/components/PostImageGallery";
import FavoriteButton from "@/components/FavoriteButton";
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

/**
 * 帖子详情页
 *
 * 路径：
 * /gallery/[id]
 *
 * 当前承担两类内容：
 * - 作品帖 WORK
 * - 公告帖 NOTICE
 *
 * 付费作品访问规则：
 * - 免费作品：所有人可看完整内容
 * - 管理员：永远可看完整内容
 * - 已购买用户：可看完整内容
 * - 未购买用户：只能看公开介绍和免费预览
 */
export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold">
            内容不存在
          </h1>

          <p className="text-zinc-400">
            无效的内容 ID：{id}
          </p>
        </div>
      </main>
    );
  }

  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold">
            内容不存在
          </h1>

          <p className="text-zinc-400">
            没有找到 ID 为 {id} 的内容。
          </p>
        </div>
      </main>
    );
  }

  // 草稿只允许管理员查看。
  if (!post.isPublished && currentUser?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h1 className="mb-4 text-4xl font-bold">
            内容暂未发布
          </h1>

          <p className="text-zinc-400">
            这篇内容目前还没有公开。
          </p>
        </div>
      </main>
    );
  }

  // 查询当前用户是否购买过该作品。
  // 管理员不需要购买。
  let hasPurchased = false;

  if (currentUser) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId: post.id,
        },
      },
    });

    hasPurchased = purchase?.status === "PAID";
  }

  const isNotice = post.type === "NOTICE";

  let favoriteCount = 0;
  let isFavorited = false;

  if (!isNotice) {
    const [count, favorite] = await Promise.all([
      prisma.favorite.count({
        where: {
          postId: post.id,
        },
      }),
      currentUser
        ? prisma.favorite.findUnique({
            where: {
              userId_postId: {
                userId: currentUser.id,
                postId: post.id,
              },
            },
            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
    ]);

    favoriteCount = count;
    isFavorited = Boolean(favorite);
  }

  const canViewPaidContent =
    !post.isPaid ||
    currentUser?.role === "ADMIN" ||
    hasPurchased;

  const postComments = post.comments.map((comment) => {
    const displayName =
      comment.user?.name || comment.username || "匿名用户";

    return {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      username: displayName,
      avatarUrl: comment.user?.avatarUrl || null,
      content: comment.content,
      createdAt: formatDateTime(comment.createdAt),
    };
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-[260px] w-[260px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={isNotice ? "/notices" : "/gallery"}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              ← 返回{isNotice ? "公告" : "作品"}列表
            </Link>

            {currentUser?.role === "ADMIN" && (
              <Link
                href={`/dashboard/posts/${post.id}/edit`}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
              >
                编辑内容
              </Link>
            )}
          </div>

          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50">
            <div className="relative h-[260px] w-full overflow-hidden bg-zinc-900 md:h-[480px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="mb-5">
                  <PostStatusBadges
                    type={post.type}
                    isPaid={post.isPaid}
                    isPinned={post.isPinned}
                    isPublished={post.isPublished}
                    showPublishedStatus={true}
                    price={post.price}
                  />
                </div>

                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  {post.title}
                </h1>

                <p className="mt-4 max-w-3xl text-zinc-300">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_320px] md:p-10">
              <div className="flex flex-col gap-8">
                <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                    <span>
                      作者：{post.author}
                    </span>

                    <span>
                      ·
                    </span>

                    <span>
                      发布于 {formatDate(post.createdAt)}
                    </span>

                    {post.updatedAt && (
                      <>
                        <span>
                          ·
                        </span>

                        <span>
                          更新于 {formatDate(post.updatedAt)}
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="mb-4 text-2xl font-bold">
                    {isNotice ? "公告内容" : "作品介绍"}
                  </h2>

                  <p className="whitespace-pre-line leading-8 text-zinc-300">
                    {post.content}
                  </p>
                </section>

                {post.previewContent && (
                  <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
                    <h2 className="mb-4 text-2xl font-bold">
                      {post.isPaid ? "免费预览" : "公开内容"}
                    </h2>

                    <p className="whitespace-pre-line leading-8 text-zinc-300">
                      {post.previewContent}
                    </p>
                  </section>
                )}

                {post.images.length > 0 && (
                  <PostImageGallery
                    images={post.images.map((image) => ({
                      id: image.id,
                      imageUrl: image.imageUrl,
                    }))}
                  />
                )}
                
                {!isNotice && (
                  <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
                    <h2 className="mb-4 text-2xl font-bold">
                      作品内容
                    </h2>

                    {canViewPaidContent ? (
                      <div className="flex flex-col gap-6">
                        {post.paidContent ? (
                          <div className="rounded-2xl border border-rose-300/20 bg-rose-950/10 p-5">
                            <h3 className="mb-3 text-xl font-bold text-rose-100">
                              已解锁内容
                            </h3>

                            <p className="whitespace-pre-line leading-8 text-zinc-300">
                              {post.paidContent}
                            </p>
                          </div>
                        ) : (
                          <p className="text-zinc-400">
                            这个作品没有填写额外隐藏内容。
                          </p>
                        )}

                        {(post.downloadUrl || post.downloadCode) && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                            <h3 className="mb-3 text-xl font-bold">
                              下载信息
                            </h3>

                            {post.downloadUrl && (
                              <p className="mb-2 text-zinc-300">
                                下载链接：{" "}
                                <a
                                  href={post.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-rose-200 underline hover:text-white"
                                >
                                  {post.downloadUrl}
                                </a>
                              </p>
                            )}

                            {post.downloadCode && (
                              <p className="text-zinc-300">
                                提取码：{post.downloadCode}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-300/20 bg-amber-950/10 p-6">
                        <h3 className="mb-3 text-xl font-bold text-amber-100">
                          付费内容未解锁
                        </h3>

                        <p className="mb-5 leading-7 text-zinc-300">
                          这是单篇付费作品。购买后可以永久查看隐藏内容、下载链接和提取码。
                        </p>

                        {currentUser ? (
                          <PurchaseButton
                            postId={post.id}
                            price={post.price}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href="/login"
                              className="rounded-full bg-white px-5 py-3 font-medium text-black hover:bg-rose-100 transition"
                            >
                              登录后购买
                            </Link>

                            <Link
                              href="/register"
                              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white hover:bg-white/10 transition"
                            >
                              注册账号
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}

                <CommentSection
                  postId={post.id}
                  comments={postComments}
                  currentUser={currentUser}
                />
              </div>

              <aside className="h-fit rounded-3xl border border-white/10 bg-black/30 p-6 md:sticky md:top-24">
                <h2 className="mb-4 text-xl font-bold">
                  内容信息
                </h2>

                {!isNotice && (
                  <div className="mb-6">
                    <FavoriteButton
                      postId={post.id}
                      initialFavorited={isFavorited}
                      initialFavoriteCount={favoriteCount}
                      isLoggedIn={Boolean(currentUser)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3 text-sm text-zinc-400">
                  <div className="flex justify-between gap-4">
                    <span>类型</span>
                    <span className="text-zinc-200">
                      {isNotice ? "公告" : "作品"}
                    </span>
                  </div>

                  {!isNotice && (
                    <div className="flex justify-between gap-4">
                      <span>价格</span>
                      <span className="text-zinc-200">
                        {post.isPaid ? `付费 ¥${post.price}` : "免费"}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span>评论</span>
                    <span className="text-zinc-200">
                      {post.comments.length}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>状态</span>
                    <span className="text-zinc-200">
                      {post.isPublished ? "已发布" : "草稿"}
                    </span>
                  </div>
                </div>

                {!isNotice && post.isPaid && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-2 text-sm font-bold text-white">
                      解锁状态
                    </p>

                    <p className="text-sm leading-6 text-zinc-400">
                      {canViewPaidContent
                        ? "你已经可以查看完整内容。"
                        : "购买后将永久解锁该作品。"}
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
