let config: object = {};
const { VITE_PUBLIC_PATH } = import.meta.env;

const setConfig = (cfg?: unknown) => {
  config = Object.assign(config, cfg);
};

const getConfig = (key?: string): ServerConfigs => {
  if (typeof key === "string") {
    const keyArray = key.split(".");
    if (keyArray && keyArray.length) {
      let data = config;
      keyArray.forEach((k) => {
        if (data && typeof data[k] !== undefined) {
          data = data[k];
        } else {
          data = null;
        }
      });
      return data;
    }
  }
  return config;
};

export { setConfig, getConfig };
