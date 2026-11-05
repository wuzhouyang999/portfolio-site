export default async function onRequestPost({ request, env }) {
  // 校验管理员密钥
  const adminToken = request.headers.get("X-Admin-Token");
  if (!adminToken || adminToken !== env.UPLOAD_SECRET) {
    return new Response(JSON.stringify({ msg: "无权限上传" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file) {
    return new Response(JSON.stringify({ msg: "请选择文件" }), { status: 400 });
  }

  // 校验格式大小
  const allowMime = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!allowMime.includes(file.type)) {
    return new Response(JSON.stringify({ msg: "仅支持 jpg/png/webp" }), { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ msg: "文件不能超过5MB" }), { status: 400 });
  }

  // 上传到 Cloudflare Images API
  const cfForm = new FormData();
  cfForm.append("file", file);
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CF_IMAGES_TOKEN}`
      },
      body: cfForm
    });
    const data = await res.json();
    if (data.success) {
      return new Response(JSON.stringify({
        success: true,
        url: data.result.variants[0]
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ msg: "上传失败", error: data.errors }), { status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ msg: "网络异常", error: err.message }), { status: 500 });
  }
}
