import { defineStore } from "pinia";
import type { UserInfo } from "./types";
import Cookies from "js-cookie";
import {
  getToken,
  SessionKey,
  setToken,
  UserNameKey,
  UserTypeKey,
  type AuthDataInfo,
} from "@/utils/auth";
import { storageSessionUtils } from "@/utils/storageSession";
import {
  passwordLoginApi,
  phoneLoginApi,
  refreshToken,
  RefreshTokenResult,
} from "@/api/user";
import { getObj } from "@/utils/getObj";
import { SetObjMapType } from "@/utils/setObj";

const userInfoMap: SetObjMapType = {
  accessToken: "token",
  userName: "nickName",
  avatar: "avatar",
  userType: "userType",
};

export const userStore = defineStore("user", {
  state: (): UserInfo => ({
    userName: Cookies.get(UserNameKey),
    avatar:
      storageSessionUtils.getItem<AuthDataInfo<number>>(SessionKey)?.avatar,
    isLogin: !!getToken(),
    userType: Number(Cookies.get(UserTypeKey) || 0),
    roles: storageSessionUtils.getItem<AuthDataInfo<number>>(SessionKey)?.roles,
    permissons:
      storageSessionUtils.getItem<AuthDataInfo<number>>(SessionKey)?.permissons,
  }),
  actions: {
    //存储用户昵称
    SET_USERNAME(userName: string | undefined) {
      this.userName = userName;
    },
    //存储用户头像
    SET_AVATAR(avatar: string | undefined) {
      this.avatar = avatar;
    },
    //存储用户类型
    SET_USER_TYPE(userType: number | undefined) {
      this.userType = userType;
    },
    //存储用户角色列表
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    //存储用户权限列表
    SET_PERMISSIONS(permissons: Array<string>) {
      this.permissons = permissons;
    },
    //手机验证码登录
    async loginByPhone(data: any) {
      return new Promise((resolve, reject) => {
        phoneLoginApi(
          getObj(data, {
            phone: "phone",
            code: "code",
          })
        )
          .then((res) => {
            setToken(
              getObj(res, {
                ...userInfoMap,
              })
            );
            this.isLogin = true;
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    /** 账号（或手机号）密码登入 */
    async loginByPassword(data: any) {
      try {
        const res = await passwordLoginApi(
          getObj(data, {
            account: "account",
            password: "password",
          })
        );
        setToken(getObj(res, { ...userInfoMap }));
        this.isLogin = true;
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    /** 刷新token */
    async handleRefreshToken(data: any) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshToken(data)
          .then((data) => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export function useUserStore() {
  return userStore();
}
