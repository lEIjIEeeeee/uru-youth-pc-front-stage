const warpperEnv = (envConf: Recordable): ViteEnv => {
  const ret: ViteEnv = {
    VITE_PORT: 9500,
    VITE_PUBLIC_PATH: "",
    VITE_ROUTER_HISTORY: "",
    VITE_API_BASE_URL: "",
    VITE_CDN: false,
    VITE_CDN_PREFIX: "",
    VITE_COMPRESSION: "none",
  };

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName =
      realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    ret[envName] = realName;

    if (typeof realName === "string") {
      process.env[envName] = realName;
    } else if (typeof realName === "object") {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
};

export { warpperEnv };
