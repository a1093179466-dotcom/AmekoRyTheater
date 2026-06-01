import Image from "next/image";
import PurchaseButton from "@/components/PurchaseButton";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CommentSection from "@/components/CommentSection";
import PostStatusBadges from "@/components/PostStatusBadges";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const postId = Number(id);

  // 如果 URL 里的 id 不是数字，比如 /gallery/abc，就直接提示无效
  if (Number.isNaN(postId)) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <p className="text-zinc-400">
          无效的帖子 ID：{id}
        </p>
      </main>
    );
  }

  // 读取当前登录用户。
  // 后面会根据用户身份决定是否显示付费内容。
  const currentUser = await getCurrentUser();

  // 从数据库读取帖子，并顺便读取评论
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <p className="text-zinc-400">
          没有找到 ID 为 {id} 的帖子。
        </p>
      </main>
    );
  }

  // 如果帖子是草稿，并且当前用户不是管理员，则不允许查看
  if (!post.isPublished && currentUser?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold mb-6">
          帖子不存在
        </h1>

        <p className="text-zinc-400">
          这个帖子暂未发布。
        </p>
      </main>
    );
  }

  // 当前阶段还没有购买系统，所以访问规则先这样定：
  // 1. 免费作品：所有人都能看完整内容
  // 2. 付费作品：管理员可以看完整内容
  // 3. 付费作品：普通用户 / 游客暂时不能看付费隐藏内容
  //
  // 等下一步做买断权限表后，这里会升级成：
  // 管理员 或 已购买用户 可以看完整内容。
// 查询当前用户是否购买过这篇作品。
// 管理员不需要购买，永远可以查看完整内容。
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

  // 付费内容查看规则：
  // 1. 免费作品：所有人可看
  // 2. 管理员：永远可看
  // 3. 已购买用户：可看
  // 4. 未购买用户：不可看
  const canViewPaidContent =
    !post.isPaid ||
    currentUser?.role === "ADMIN" ||
    hasPurchased;

  const postComments = post.comments.map((comment) => ({
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    username: comment.username,
    content: comment.content,
    createdAt: comment.createdAt.toLocaleString(),
  }));

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={900}
          height={560}
          className="rounded-2xl mb-8 w-full h-auto"
        />

        <div className="mb-6">
          <PostStatusBadges
            type={post.type}
            isPaid={post.isPaid}
            isPinned={post.isPinned}
            isPublished={post.isPublished}
            showPublishedStatus={true}
            price={post.price}
          />
        </div>

        <h1 className="text-4xl font-bold mb-4">
          {post.title}
        </h1>

        <p className="text-zinc-500 mb-8">
          作者：{post.author} · 发布于{" "}
          {post.createdAt.toLocaleDateString()}
        </p>

        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4">
            作品介绍
          </h2>

          <p className="text-zinc-300 leading-8 whitespace-pre-line">
            {post.content}
          </p>
        </section>

        {post.previewContent && (
          <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4">
              免费预览
            </h2>

            <p className="text-zinc-300 leading-8 whitespace-pre-line">
              {post.previewContent}
            </p>
          </section>
        )}

        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4">
            作品内容
          </h2>

          {canViewPaidContent ? (
            <div className="flex flex-col gap-6">
              {post.paidContent ? (
                <div>
                  <h3 className="text-xl font-bold mb-3">
                    隐藏内容
                  </h3>

                  <p className="text-zinc-300 leading-8 whitespace-pre-line">
                    {post.paidContent}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400">
                  这个作品没有填写额外隐藏内容。
                </p>
              )}

              {(post.downloadUrl || post.downloadCode) && (
                <div className="bg-black border border-zinc-700 rounded-xl p-5">
                  <h3 className="text-xl font-bold mb-3">
                    下载信息
                  </h3>

                  {post.downloadUrl && (
                    <p className="text-zinc-300 mb-2">
                      下载链接：{" "}
                      <a
                        href={post.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
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
            <div className="bg-black border border-zinc-700 rounded-xl p-5">
              <p className="text-zinc-300 mb-3">
                这是付费作品，购买后可以查看隐藏内容和下载信息。
              </p>

            {currentUser ? (
            <PurchaseButton
              postId={post.id}
              price={post.price}
            />
          ) : (
            <p className="text-zinc-500">
              请先登录账号，之后才能购买作品。
            </p>
            )}
            </div>
          )}
        </section>

        <CommentSection
          postId={post.id}
          comments={postComments}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
}