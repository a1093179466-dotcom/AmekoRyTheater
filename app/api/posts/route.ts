import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const excerpt = String(body.excerpt || "").trim();
    const content = String(body.content || "").trim();
    const price = Number(body.price || 0);

    if (!title) {
      return Response.json(
        {
          success: false,
          message: "标题不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (!excerpt) {
      return Response.json(
        {
          success: false,
          message: "简介不能为空",
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
          message: "正文不能为空",
        },
        {
          status: 400,
        }
      );
    }

    if (Number.isNaN(price) || price < 0) {
      return Response.json(
        {
          success: false,
          message: "价格必须是大于等于 0 的数字",
        },
        {
          status: 400,
        }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        excerpt,
        content,
        coverImage: "/images/test1.jpg",
        author: "AmekoRy",
        isPaid: price > 0,
        price,
      },
    });

    return Response.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("创建帖子失败：", error);

    return Response.json(
      {
        success: false,
        message: "服务器创建帖子失败",
      },
      {
        status: 500,
      }
    );
  }
}