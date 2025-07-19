import { loadEnv, type ConfigEnv, type UserConfigExport } from "vite";
import { resolve } from "path";
import { warpperEnv } from "./build/index";
import vue from "@vitejs/plugin-vue";

//当前执行node命令时文件夹的地址（工作目录）
const root = process.cwd();

//路径查找
const pathResolve = (dir: string): string => {
  return resolve(__dirname, ".", dir);
};

//设置导入文件路径别名
const alias: Record<string, string> = {
  "@": pathResolve("src"),
  "@build": pathResolve("build"),
};

// https://vite.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const {
    VITE_PORT,
    VITE_PUBLIC_PATH,
    VITE_API_BASE_URL,
    VITE_CDN,
    VITE_CDN_PREFIX,
    VITE_COMPRESSION,
  } = warpperEnv(loadEnv(mode, root));
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias,
    },
    //服务端渲染
    server: {
      port: VITE_PORT,
      host: "0.0.0.0",
      proxy: {
        "^/api/.*": {
          target: `${VITE_API_BASE_URL}`,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [vue()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/style/element-plus/index.scss";
            $cdn_prefix:"${VITE_CDN_PREFIX}";
          `,
        },
      },
    },
  };
};
