<script lang="ts" setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import { PasswordLoginRequest, LoginTypeEnum, PhoneLoginRequest, SendSmsCodeRequest } from './types';
import { ElInput, ElMessage, FormInstance, FormRules } from 'element-plus';
import { userStore } from '@/store/user';
import router from '@/router';
import useMainLoading from '@/hooks/useMainLoading';
import RegExp from '@/utils/regexp';
import { sendSmsCodeApi } from '@/api/user';
import codeTimer from '@/utils/codeTimer';

const { mainLoading, openMainLoading, closeMainLoading } = useMainLoading()
const loading = computed(() => mainLoading.value)

const currentTab = ref<LoginTypeEnum>(LoginTypeEnum.SMS)
const smsTab = computed(() => currentTab.value === LoginTypeEnum.SMS)
const pwdTab = computed(() => currentTab.value === LoginTypeEnum.PWD)

const switchTab = (tab: LoginTypeEnum) => {
  if (loading.value || currentTab.value === tab) return
  currentTab.value = tab
}

const phoneLoginFormData = reactive(new PhoneLoginRequest())
const passwordLoginFormData = reactive(new PasswordLoginRequest())
const formRef = ref<FormInstance>();
const rules: FormRules = {
  phone: [
    {
      required: true,
      message: "请输入手机号",
      trigger: "blur"
    },
    {
      pattern: RegExp.phone,
      message: "请输入正确的手机号",
      trigger: "blur"
    }
  ],
  code: [
    {
      required: true,
      message: "请输入验证码",
      trigger: 'blur'
    },
    {
      pattern: RegExp.code,
      message: "请输入正确的验证码",
      trigger: "blur"
    }
  ],
  account: [
    {
      required: true,
      message: "请输入账号/手机号",
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: 'blur'
    }
  ],
}

const userLogin = async () => {
  if (smsTab.value) {
    loginByPhone()
  } else if (pwdTab.value) {
    loginByPassword()
  } else {
    ElMessage.error("登录异常")
  }
}

const loginByPhone = async () => {
  try {
    openMainLoading()
    await formRef.value.validate();
    await userStore().loginByPhone(phoneLoginFormData)
    router.push("/")
    ElMessage.success("登录成功");
  } catch (e) {
    console.log(e)
  } finally {
    closeMainLoading()
  }
}

const loginByPassword = async () => {
  try {
    openMainLoading()
    await formRef.value.validate();
    await userStore().loginByPassword(passwordLoginFormData)
    router.push("/")
    ElMessage.success("登录成功")
  } catch (e) {
    console.log(e)
  } finally {
    closeMainLoading()
  }
}

const codeInputRef = ref<InstanceType<typeof ElInput>>()
const codeIsHover = ref(false)

const { second, loading: codeTimerLoading, isDisabled: codeTimerDisabled, startTimer } = codeTimer()
const sendBtnColor = computed(() => phoneLoginFormData.phone?.match(RegExp.phone) && !codeTimerDisabled.value)
const sendCodeBtnDisabled = computed(() => loading.value || codeTimerLoading.value || codeTimerDisabled.value || !phoneLoginFormData.phone?.match(RegExp.phone))

const handleSendCode = async () => {
  try {
    if (sendCodeBtnDisabled.value) return
    await startTimer(sendSmsCode, 60)
  } catch (e) {
    console.log(e)
  } finally {
    codeInputRef.value?.focus()
  }
}

const sendSmsCodeRequest = reactive(new SendSmsCodeRequest())
const sendSmsCode = async () => {
  await formRef.value.validateField('phone')
  sendSmsCodeRequest.phone = phoneLoginFormData.phone;
  sendSmsCodeRequest.scene = "login"
  await sendSmsCodeApi(sendSmsCodeRequest);
  ElMessage.success("发送成功")
}

const handleBtnMouseDown = () => {
  codeInputRef.value?.focus()
}

watchEffect(() => {
  if (smsTab.value) {
    Object.assign(phoneLoginFormData, new PhoneLoginRequest())
  }
  if (pwdTab.value) {
    Object.assign(passwordLoginFormData, new PasswordLoginRequest())
  }
})
</script>

<template>
  <div class="w-full min-w-[800px] relative">
    <div class="absolute inset-0 login-bg bg-no-repeat bg-cover bg-center"></div>
    <div class="relative min-h-[100vh] flex justify-end items-center px-[8%] py-[4%]">
      <div class="w-[30%] min-w-[360px] min-h-[600px] rounded-2xl px-[34px] py-[50px] bg-white">
        <!-- 标题 -->
        <div class="truncate">
          <div class="font-semibold text-3xl">欢迎登录</div>
          <span class="font-comic font-semibold text-4xl text-orange-500">Uru</span>
          <span class="font-semibold text-2xl ml-4px">芳华帖后台管理</span>
        </div>
        <!-- 登录方式 -->
        <div class="mt-[40px]">
          <div class="flex items-start text-[18px] text-[#505050] leading-[18px] mb-[24px]">
            <div class="cursor-pointer pb-[8px]"
              :class="{ 'tab-active': smsTab, 'sms-tab-disabled': loading && !smsTab }"
              @click="switchTab(LoginTypeEnum.SMS)">
              短信登录
            </div>
            <div class="w-[1px] h-[18px] bg-[#e3e5e7] mx-[20px]"></div>
            <div class="cursor-pointer pb-[8px]"
              :class="{ 'tab-active': pwdTab, 'pwd-tab-disabled': loading && !pwdTab }"
              @click="switchTab(LoginTypeEnum.PWD)">
              账号登录
            </div>
          </div>
          <el-form :model="pwdTab ? passwordLoginFormData : smsTab ? phoneLoginFormData : undefined" ref="formRef"
            :rules="rules" :disabled="loading">
            <!-- 短信登录表单 -->
            <div v-if="smsTab">
              <el-form-item prop="phone">
                <el-input v-model="phoneLoginFormData.phone" placeholder="手机号" clearable>
                  <template #prefix>
                    <el-icon size="20px">
                      <iphone />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item class="code-form-item" prop="code">
                <el-input class="code-input h-full  overflow-hidden" :class="{ 'is-hover': codeIsHover }"
                  v-model="phoneLoginFormData.code" ref="codeInputRef" placeholder="验证码" clearable
                  @mouseenter="codeIsHover = true" @mouseleave="codeIsHover = false">
                  <template #prefix>
                    <el-icon size="20px">
                      <message />
                    </el-icon>
                  </template>
                  <template #append>
                    <div class="w-[70px] h-full flex justify-center items-center leading-[30px]">
                      <el-button class="cursor-pointer"
                        :class="{ 'send-code-btn-disabled': sendCodeBtnDisabled, '!text-[#00a1d6]': sendBtnColor }"
                        @click.prevent="handleSendCode" @mousedown.prevent="handleBtnMouseDown"
                        :loading="codeTimerLoading">
                        {{ codeTimerLoading ? null : second > 0 ? `${second}s后重试` : '获取验证码' }}
                      </el-button>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </div>
            <!-- 密码登录表单 -->
            <div v-if="pwdTab">
              <el-form-item prop="account">
                <el-input v-model="passwordLoginFormData.account" placeholder="账号" clearable>
                  <template #prefix>
                    <el-icon size="20px">
                      <user />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input type="password" v-model="passwordLoginFormData.password" placeholder="密码" show-password
                  clearable>
                  <template #prefix>
                    <el-icon size="20px">
                      <lock />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </el-form>
          <div class=" mt-[20px]">
            <el-button class="w-full login-btn" type="primary" round @click="userLogin" :loading="loading">
              登录
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-bg {
  background-image: url('@/assets/login/bg.png');
}

.tab-active {
  font-weight: 500;
  color: #f1844a;
  position: relative;
}

.tab-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 70%;
  height: 2px;
  background-color: currentColor;
  border-radius: 1px;
  transform: translateX(-50%);
}

.pwd-tab-disabled,
.sms-tab-disabled {
  cursor: not-allowed !important;
}

$border-color: #dcdfe6;
$border-color-hover: #c6cad1;
$border-color-focus: #f1844a;
$border-color-error: #f56c6c;

:deep(.el-input__wrapper) {
  border-radius: 20px;
  height: 40px;
}

.code-input {
  position: relative;
  overflow: hidden;

  /** 默认状态 */
  &:deep(.el-input__wrapper) {
    border-radius: 20px 0 0 20px;
    box-shadow:
      0 -1px 0 0 $border-color inset,
      0 1px 0 0 $border-color inset,
      1px 0 0 0 $border-color inset,
      0 0 0 0 transparent;
    transition: box-shadow 0.1s ease;
  }

  &:deep(.el-input-group__append) {
    width: 94px;
    background-color: #fff;
    border-radius: 0 20px 20px 0;
    padding: 0 12px;
    box-shadow:
      0 -1px 0 0 $border-color inset,
      0 1px 0 0 $border-color inset,
      0 0 0 0 transparent,
      -1px 0 0 0 $border-color inset;
    transition: box-shadow 0.1s ease;
  }

  /** 鼠标移入input输入框，激活hover状态 */
  &.is-hover {
    &:deep(.el-input__wrapper) {
      box-shadow:
        0 -1px 0 0 $border-color-hover inset,
        0 1px 0 0 $border-color-hover inset,
        1px 0 0 0 $border-color-hover inset,
        0 0 0 0 transparent;
      transition: box-shadow 0.1s ease;
    }

    &:deep(.el-input-group__append) {
      box-shadow:
        0 -1px 0 0 $border-color-hover inset,
        0 1px 0 0 $border-color-hover inset,
        0 0 0 0 transparent,
        -1px 0 0 0 $border-color-hover inset;
      transition: box-shadow 0.1s ease;
    }
  }

  /** input输入框聚焦状态 */
  &:deep(.el-input__wrapper.is-focus) {
    box-shadow:
      0 -1px 0 0 $border-color-focus inset,
      0 1px 0 0 $border-color-focus inset,
      1px 0 0 0 $border-color-focus inset,
      0 0 0 0 transparent;
    transition: box-shadow 0.1s ease;
  }

  &:deep(.el-input__wrapper.is-focus + .el-input-group__append) {
    box-shadow:
      0 -1px 0 0 $border-color-focus inset,
      0 1px 0 0 $border-color-focus inset,
      0 0 0 0 transparent,
      -1px 0 0 0 $border-color-focus inset;
    transition: box-shadow 0.1s ease;
  }
}

.code-form-item.is-error {
  &:deep(.el-input__wrapper, .el-input__wrapper:hover) {
    box-shadow:
      0 -1px 0 0 $border-color-error inset,
      0 1px 0 0 $border-color-error inset,
      1px 0 0 0 $border-color-error inset,
      0 0 0 0 transparent !important;
    transition: box-shadow 0.1s ease;
  }

  &:deep(.el-input-group__append, .el-input-group__append:hover) {
    box-shadow:
      0 -1px 0 0 $border-color-error inset,
      0 1px 0 0 $border-color-error inset,
      0 0 0 0 transparent,
      -1px 0 0 0 $border-color-error inset !important;
    transition: box-shadow 0.1s ease;
  }
}

.code-input :deep(.el-input-group__append::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  background-color: $border-color;
  width: 1px;
  height: 60%;
  transform: translateY(-50%);

}

.send-code-btn-disabled {
  cursor: not-allowed;
  color: $border-color;
}

.login-btn {
  height: 40px;
}
</style>