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
} from "@/util/auth";
import { storageSessionUtils } from "@/util/storageSession";
import {
  loginByAccount,
  loginByPhoneCode,
  refreshToken,
  RefreshTokenResult,
} from "@/api/user";
import { getObj } from "@/util/getObj";
import { SetObjMapType } from "@/util/setObj";

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
    async loginByPhoneCode(data: any) {
      return new Promise((resolve, reject) => {
        loginByPhoneCode(
          getObj(data, {
            phoneNumber: "phone",
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
    async loginByAccount(data: any) {
      return new Promise((resolve, reject) => {
        loginByAccount(
          getObj(data, {
            account: "account",
            password: "password",
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
    /** 刷新token */
    async handleRefreshToken(data:any) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshToken(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
  },
});

export function useUserStore() {
  return userStore();
}
