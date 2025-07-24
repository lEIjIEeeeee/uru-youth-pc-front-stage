import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  CustomParamsSerializer,
} from "axios";
import { stringify } from "qs";
import {
  RequestMethods,
  UruHttpError,
  UruHttpRequestConfig,
  UruHttpResponse,
} from "./type";
import nProgress from "nprogress";
import { formatToken, getToken } from "../auth";
import { userStore } from "@/store/user";
import { get } from "lodash-unified";
import { ElMessage } from "element-plus";

/* 默认配置 */
const defaultConfig: AxiosRequestConfig = {
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
  timeout: 10000,
};

class UruHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  private static requests: Array<(token: string) => void> = [];
  private static isRefreshing = false;

  private static ensureHeaders(config: UruHttpRequestConfig) {
    config.headers = config.headers ?? {};
    return config.headers;
  }

  private static retryOriginalRequest(config: UruHttpRequestConfig) {
    return new Promise((resolve) => {
      UruHttp.requests.push((token: string) => {
        const headers = UruHttp.ensureHeaders(config);
        headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  private static initConfig: UruHttpRequestConfig = {
    returnData: true,
    showMsg: true,
    throwError: true,
  };

  private static axiosInstance: AxiosInstance = axios.create(defaultConfig);

  private httpInterceptorsRequest(): void {
    UruHttp.axiosInstance.interceptors.request.use(
      async (config: UruHttpRequestConfig): Promise<any> => {
        //开启进度条动画
        nProgress.start();
        //优先判断非全局配置中的回调，如post/get等单次请求，使用默认的defaultConfig
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        //再判断是否是全局配置回调
        if (UruHttp.initConfig.beforeRequestCallback) {
          UruHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        const whiteList = ["/register", "/login"];
        //可优化，复杂路由使用正则去匹配或者path-to-regexp（需要引入依赖）去匹配
        return whiteList.some((v) => config.url?.includes(v))
          ? config
          : new Promise((resolve) => {
              const data = getToken();
              if (data) {
                const now = new Date().getTime();
                const isExpired = data.expires - now <= 0;
                if (isExpired) {
                  if (!UruHttp.isRefreshing) {
                    UruHttp.isRefreshing = true;
                    //token过期刷新
                    userStore()
                      .handleRefreshToken({ refreshToken: data.refreshToken })
                      .then((res) => {
                        const token = res.data.accessToken;
                        const headers = UruHttp.ensureHeaders(config);
                        headers["Authorization"] = formatToken(token);
                        UruHttp.requests.forEach((cb) => cb(token));
                        UruHttp.requests = [];
                      })
                      .finally(() => {
                        UruHttp.isRefreshing = false;
                      });
                  }
                  resolve(UruHttp.retryOriginalRequest(config));
                } else {
                  const headers = UruHttp.ensureHeaders(config);
                  headers["Authorization"] = formatToken(data.accessToken);
                  resolve(config);
                }
              } else {
                resolve(config);
              }
            });
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private httpInterceptorsResponse(): void {
    UruHttp.axiosInstance.interceptors.response.use(
      (response: UruHttpResponse) => {
        const _config = response.config;
        // 关闭进度条动画
        nProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof _config.beforeResponseCallback === "function") {
          _config.beforeResponseCallback(response);
          return response.data;
        }
        if (UruHttp.initConfig.beforeResponseCallback) {
          UruHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        const code = get(response.data, "code");
        const msg = get(response.data, "message", "未知错误");
        const data = get(response.data, "data");
        const returnData =
          (typeof _config.returnData === "boolean" && _config.returnData) ||
          (typeof _config.returnData !== "boolean" &&
            UruHttp.initConfig.returnData);
        const showMsg =
          (typeof _config.showMsg === "boolean" && _config.showMsg) ||
          (typeof _config.showMsg !== "boolean" && UruHttp.initConfig.showMsg);
        const throwError =
          (typeof _config.throwError === "boolean" && _config.throwError) ||
          (typeof _config.throwError !== "boolean" &&
            UruHttp.initConfig.throwError);
        if (code != 0) {
          //TODO 未登录状态、Token验证错误状态
          if (showMsg) {
            ElMessage({
              type: "error",
              message: msg,
            });
          }
          if (throwError) {
            return Promise.reject(new Error(code || "error"));
          }
        }
        if (returnData) {
          return data;
        }
        return response.data;
      },
      (error: UruHttpError) => {
        const $error = error;
        $error.isCancelRequest = axios.isCancel($error);
        const $config = $error.config as UruHttpRequestConfig;
        // 关闭进度条动画
        nProgress.done();
        // 返回请求失败信息
        let msg = "网络请求错误";
        const _response = $error.response;
        if (_response) {
          const _data = _response.data as { message?: string };
          if (_data && typeof _data === "object") {
            msg = _data.message;
          } else {
            msg = `请求失败：${_response.status} ${_response.statusText}`;
          }
        } else {
          msg = $error.message;
        }

        if (
          !$error.isCancelRequest &&
          $config.showMsg !== false &&
          UruHttp.initConfig.showMsg !== false
        ) {
          ElMessage.error({
            type: "error",
            message: msg,
          });
        }
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  //通用处理请求工具方法
  public request<T = any>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: UruHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig,
    } as UruHttpRequestConfig;

    return new Promise((resolve, reject) => {
      UruHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //处理post请求工具方法
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: UruHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("post", url, params, config);
  }

  //处理get请求工具方法
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: UruHttpRequestConfig
  ): Promise<P> {
    return this.request("get", url, params, config);
  }
}

export const http = new UruHttp();
