import { http } from "@/utils/http";
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

export const phoneLoginApi = (data: any) => {
  return http.request("post", apiBaseUrl("/authModule/login/loginByPhone"), {
    data,
  });
};

export const passwordLoginApi = (data: any) => {
  return http.request("post", apiBaseUrl("/authModule/login/loginByPassword"), {
    data,
  });
};

export const sendSmsCodeApi = (data: any) => {
  return http.request("post", apiBaseUrl("/authModule/login/sendSmsCode"), {
    data,
  });
};

export const refreshToken = (data?: any) => {
  return http.request<RefreshTokenResult>("post", apiBaseUrl("/refreshToken"), {
    data,
  });
};
