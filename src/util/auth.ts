import Cookies from "js-cookie";
import { storageSessionUtils } from "./storageSession";
import { useUserStore } from "@/store/user";
import { getObj } from "./getObj";

export interface AuthDataInfo<T> {
  //token
  accessToken: string;
  //accessToken过期时间，泛型T用于适配不同时间类型
  expires: T;
  //用于调用刷新accessToken的接口时所需的token
  refreshToken: string;
  //用户名
  userName?: string;
  //头像
  avatar?: string;
  //用户类型
  userType?: number;
  //当前用户的角色
  roles?: Array<string>;
  //当前用户的权限
  permissons?: Array<string>;
}

export const TokenKey = "authorized-token";
export const SessionKey = "user-info";
export const UserNameKey = "userName";
export const UserTypeKey = "userType";

export function getToken(): AuthDataInfo<number> | null {
  const token = Cookies.get(TokenKey);
  if (token) {
    const data = JSON.parse(token);
    return AuthDataTypeCheck(data)
      ? data
      : storageSessionUtils.getItem(SessionKey);
  }
  return null;
}

export function setToken(data: AuthDataInfo<Date>) {
  if (data.accessToken) {
    const tokenString = JSON.stringify({
      accessToken: data.accessToken,
    });
    Cookies.set(TokenKey, tokenString);
    if (data.userName) {
      Cookies.set(UserNameKey, data.userName);
    }
    if (data.userType) {
      Cookies.set(UserTypeKey, data.userType.toString());
    }
    //userStore
    useUserStore().SET_USERNAME(data.userName);
    useUserStore().SET_USER_TYPE(data.userType);
  }

  function setSessionKey({ avatar }: AuthDataInfo<Date>) {
    useUserStore().SET_AVATAR(avatar);
    storageSessionUtils.setItem(SessionKey, {
      avatar,
    });
  }

  if (data.avatar) {
    setSessionKey(data);
  } else {
    setSessionKey(
      getObj<AuthDataInfo<Date>>(
        storageSessionUtils.getItem<AuthDataInfo<number>>(SessionKey),
        {
          avatar: "avatar",
        }
      )
    );
  }
}

export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(UserNameKey);
  Cookies.remove(UserTypeKey);
  storageSessionUtils.removeItem(SessionKey);
}

//格式化token（jwt格式）
export function formatToken(token: string): string {
  return token;
}

function AuthDataTypeCheck(obj: any): obj is AuthDataInfo<number> {
  return (
    obj &&
    typeof obj.accessToken === "string" &&
    typeof obj.expireTime === "number" &&
    typeof obj.refreshToken === "string"
  );
}
