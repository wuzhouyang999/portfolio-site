export async function onRequestPost({ request, env }) {
  // ========== 鉴权校验 ==========
  const adminToken = request.headers.get("X-Admin-Token");
  if (!adminToken || adminToken !== env.UPLOAD_SECRET) {
    return new Response(JSON.stringify({ msg: "无权限上传" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ========== 文件校验 ==========
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file) {
    return new Response(JSON.stringify({ msg: "请选择文件" }), { status: 400 });
  }
  const allowMime = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!allowMime.includes(file.type)) {
    return new Response(JSON.stringify({ msg: "仅支持 jpg/png/webp" }), { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ msg: "文件不能超过5MB" }), { status: 400 });
  }

  // ========== R2上传逻辑 ==========
  const bucket = env.UPLOAD_BUCKET;
  const ext = file.type.split("/")[1];
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  await bucket.put(fileName, file.stream(), {
    httpMetadata: { contentType: file.type }
  });
  const fileUrl = `https://${bucket.bucketName}.r2.cloudflarestorage.com/${fileName}`;

  return new Response(JSON.stringify({ success: true, url: fileUrl }), {
    headers: { "Content-Type": "application/json" }
  });
}
