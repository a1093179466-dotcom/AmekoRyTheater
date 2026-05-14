export async function POST(request: Request) {

  const body = await request.json();

  console.log("后端收到的数据：", body);

  return Response.json({
    success: true,
    message: "作品创建成功",
  });

}