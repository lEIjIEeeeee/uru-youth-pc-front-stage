import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<
  Method,
  "get" | "post" | "put" | "patch" | "delete" | "options" | "head"
>;

export interface UruHttpResponse extends AxiosResponse {
  config: UruHttpRequestConfig;
}

export interface UruHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: UruHttpRequestConfig) => void;
  beforeResponseCallback?: (response: UruHttpResponse) => void;
  returnData?: boolean;
  showMsg?: boolean;
  throwError?: boolean;
}

export interface UruHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export default class UruHttp {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: UruHttpRequestConfig
  ): Promise<T>;
  post<T, P>(
    url: string,
    params?: T,
    config?: UruHttpRequestConfig
  ): Promise<P>;
  get<T, P>(
    url: string,
    params?: T,
    config?: UruHttpRequestConfig
  ): Promise<P>;
}
