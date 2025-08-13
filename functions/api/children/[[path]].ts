import { notFound, parseBucketPath } from "@/utils/bucket";
import { get_list_auth_status } from "@/utils/auth";

export async function onRequestGet(context) {
  try {
    const [bucket, path] = parseBucketPath(context);
    const prefix = path && `${path}/`;
    if (!bucket || prefix.startsWith("_$flaredrive$/")) return notFound();

    // 检查文件列表访问权限
    const authResult = get_list_auth_status(context, path || "");

    if (!authResult.hasAccess) {
      // 没有权限访问，返回需要登录的响应（不包含WWW-Authenticate头，避免弹出浏览器登录框）
      return new Response(JSON.stringify({
        needLogin: true,
        message: "需要登录才能查看文件列表"
      }), {
        status: 200, // 改为200状态码，避免触发浏览器登录框
        headers: {
          "Content-Type": "application/json"
        },
      });
    }

    const objList = await bucket.list({
      prefix,
      delimiter: "/",
      include: ["httpMetadata", "customMetadata"],
    });

    let objKeys = objList.objects
      .filter((obj) => !obj.key.endsWith("/_$folder$"))
      .map((obj) => {
        const { key, size, uploaded, httpMetadata, customMetadata } = obj;
        return { key, size, uploaded, httpMetadata, customMetadata };
      });

    let folders = objList.delimitedPrefixes;
    if (!path)
      folders = folders.filter((folder) => folder !== "_$flaredrive$/");

    // 根据用户权限过滤内容
    if (!authResult.isGuest) {
      // 已登录用户：根据用户权限过滤
      const headers = new Headers(context.request.headers);
      if(headers.get('Authorization')) {
        const Authorization = headers.get('Authorization').split("Basic ")[1];
        const account = atob(Authorization);
        if(account && context.env[account]) {
          const allow = context.env[account].split(",");

          // 如果不是管理员，需要过滤内容
          if (!allow.includes("*")) {
            // 获取游客权限，已登录用户也应该能访问游客目录
            const guestEnv = context.env["GUEST"] || context.env["guest"];
            const allow_guest = guestEnv ? guestEnv.split(",") : [];

            // 合并用户权限和游客权限
            const combinedPermissions = [...allow, ...allow_guest];

            // 过滤文件：显示用户有权限的文件 + 游客可访问的文件
            objKeys = objKeys.filter(file => {
              for (var a of combinedPermissions) {
                if (a == "*") return true;
                if (file.key.startsWith(a)) return true;
              }
              return false;
            });

            // 过滤文件夹：显示用户有权限的文件夹 + 游客可访问的文件夹
            folders = folders.filter(folder => {
              for (var a of combinedPermissions) {
                if (a == "*") return true;
                if (folder.startsWith(a)) return true;
              }
              return false;
            });
          }
        }else if(account && context.env[account + ':r']){
          // 处理只读用户
          const allow = context.env[account + ':r'].split(",");

          // 获取游客权限，已登录用户也应该能访问游客目录
          const guestEnv = context.env["GUEST"] || context.env["guest"];
          const allow_guest = guestEnv ? guestEnv.split(",") : [];

          // 合并用户权限和游客权限
          const combinedPermissions = [...allow, ...allow_guest];

          // 过滤文件：显示用户有权限的文件 + 游客可访问的文件
          objKeys = objKeys.filter(file => {
            for (var a of combinedPermissions) {
              if (a == "*") return true;
              if (file.key.startsWith(a)) return true;
            }
            return false;
          });

          // 过滤文件夹：显示用户有权限的文件夹 + 游客可访问的文件夹
          folders = folders.filter(folder => {
            for (var a of combinedPermissions) {
              if (a == "*") return true;
              if (folder.startsWith(a)) return true;
            }
            return false;
          });
        }
      }
    } else {
      // 游客用户：根据游客权限过滤
      const guestEnv = context.env["GUEST"] || context.env["guest"];
      if (guestEnv) {
        const allow_guest = guestEnv.split(",");

        // 过滤文件：只显示游客有权限的文件
        objKeys = objKeys.filter(file => {
          for (var aa of allow_guest) {
            if (aa == "*") return true;
            if (file.key.startsWith(aa)) return true;
          }
          return false;
        });

        // 过滤文件夹：只显示游客有权限的文件夹
        folders = folders.filter(folder => {
          for (var aa of allow_guest) {
            if (aa == "*") return true;
            if (folder.startsWith(aa)) return true;
          }
          return false;
        });
      }
    }

    return new Response(JSON.stringify({
      value: objKeys,
      folders,
      isGuest: authResult.isGuest
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}
