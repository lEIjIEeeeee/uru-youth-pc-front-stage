export enum LoginTypeEnum {
  SMS = "sms",
  PWD = "pwd",
}

export class PasswordLoginRequest {
  account: string;
  password: string;
}

export class PhoneLoginRequest {
  phone: string;
  code: string;
}

export class SendSmsCodeRequest {
  phone: string;
  scene: string;
}
