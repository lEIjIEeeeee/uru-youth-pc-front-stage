export enum LoginTypeEnum {
  PWD = "pwd",
  SMS = "sms",
}

export class PasswordLoginRequest {
  account: "";
  password: "";
}

export class PhoneLoginRequest {
  phone: "";
  code: "";
}
