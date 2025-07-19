import { http } from "@/util/http";
import { apiBaseUrl } from "./common";

export type RefreshTokenResult = {
  sucess: boolean;
  data: {
    username: string;
    accessToken: string;
    refreshToken: string;
    expires: Date;
    roles: Array<string>;
  };
};

export const loginByPhoneCode = (data: any) => {
  return http.request("post", apiBaseUrl("/authModule/login/login"), {
    data,
  });
};

export const loginByAccount = (data: any) => {
  return http.request("post", apiBaseUrl("/authModule/login/login"), {
    data,
  });
};

export const refreshToken = (data?: any) => {
  return http.request<RefreshTokenResult>("post", apiBaseUrl("/refreshToken"), {
    data,
  });
};

export const init = (id: number) => {
  return http.request("get", apiBaseUrl("/demoModule/demo/get"), {
    params: {
      id,
    },
  });
};
