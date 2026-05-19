import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const postId = Number(body.postId);
    const username = String(body.username || "当前用户");
    const content = String(body.content || "").trim();

    if (!postId) {
      return Response.json(
        {
          success: false,
          message: "postId 无效",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return Response.json(
        {
          success: false,
          message: "评论内容不能为空",
        },
        {
          status: 400,
        }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        username,
        content,
      },
    });

    return Response.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("创建评论失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器创建评论失败",
      },
      {
        status: 500,
      }
    );
  }
}