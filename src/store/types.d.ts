export interface UserInfo {
  userName?: string;
  avatar?: string;
  isLogin: boolean;
  userType?: number;
  roles?: Array<string>;
  permissons?: Array<string>;
}
