<script lang="ts" setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import { PasswordLoginRequest, LoginTypeEnum, PhoneLoginRequest } from './types';
import { ElInput, FormInstance, FormRules } from 'element-plus';
import { userStore } from '@/store/user';
import router from '@/router';
import useMainLoading from '@/hooks/useMainLoading';
import RegExp from '@/utils/regexp';

const { mainLoading, openMainLoading, closeMainLoading } = useMainLoading()
const loading = computed(() => mainLoading.value)

const currentTab = ref<LoginTypeEnum>(LoginTypeEnum.PWD)
const pwdTab = computed(() => currentTab.value === LoginTypeEnum.PWD)
const smsTab = computed(() => currentTab.value === LoginTypeEnum.SMS)

const switchTab = (tab: LoginTypeEnum) => {
  if (loading.value || currentTab.value === tab) return
  currentTab.value = tab
}

const passwordLoginFormData = reactive(new PasswordLoginRequest())
const phoneLoginFormData = reactive(new PhoneLoginRequest())
const formRef = ref<FormInstance>();
const rules: FormRules = {
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
  ]
}

const userLogin = async () => {
  if (pwdTab.value) {
    loginByPassword()
  } else if (smsTab.value) {
    loginByPhone()
  } else {
    //TODO  message
  }
}

const loginByPassword = async () => {
  try {
    openMainLoading()
    await formRef.value.validate();
    await userStore().loginByPassword(passwordLoginFormData)
    router.push("/")
    console.log("登录成功")
    //TODO message
  } catch (e) {
    console.log(e)
  } finally {
    closeMainLoading()
  }
}

const loginByPhone = async () => {
  try {
    openMainLoading()
    await formRef.value.validate();
    await userStore().loginByPhone(phoneLoginFormData)
    router.push("/")
    console.log("登录成功")
    //TODO message
  } catch (e) {
    console.log(e)
  } finally {
    closeMainLoading()
  }
}

watchEffect(() => {
  if (pwdTab.value) {
    Object.assign(passwordLoginFormData, new PasswordLoginRequest())
  }
  if (smsTab.value) {
    Object.assign(phoneLoginFormData, new PhoneLoginRequest())
  }
})

const countDown = ref(0)
const sendCodeBtnDisabled = computed(() => loading.value || !phoneLoginFormData.phone?.match(RegExp.phone))
const codeInputRef = ref<InstanceType<typeof ElInput>>()
const handleSendCode = async () => {
  if (sendCodeBtnDisabled.value) return
  try {
    await formRef.value.validateField('phone')
    //TODO 发送验证码
    console.log("验证码发送成功")
    countDown.value = 60
    const timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (e) {
    console.log("验证码发送失败", e)
  } finally {
    codeInputRef.value?.focus()
  }
}

const handleBtnMouseDown = () => {
  codeInputRef.value?.focus()
}
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
        <div class="mt-[40px]">
          <div class="flex items-start text-[18px] text-[#505050] leading-[18px] mb-[24px]">
            <div class="cursor-pointer pb-[8px]"
              :class="{ 'tab-active': pwdTab, 'pwd-tab-disabled': loading && !pwdTab }"
              @click="switchTab(LoginTypeEnum.PWD)">
              账号登录
            </div>
            <div class="w-[1px] h-[18px] bg-[#e3e5e7] mx-[20px]"></div>
            <div class="cursor-pointer pb-[8px]"
              :class="{ 'tab-active': smsTab, 'sms-tab-disabled': loading && !smsTab }"
              @click="switchTab(LoginTypeEnum.SMS)">
              短信登录
            </div>
          </div>
          <!-- 账号密码登录表单 -->
          <el-form :model="pwdTab ? passwordLoginFormData : smsTab ? phoneLoginFormData : undefined" ref="formRef"
            :rules="rules" :disabled="loading">
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
                <el-input class="code-input" v-model="phoneLoginFormData.code" ref="codeInputRef" placeholder="验证码"
                  clearable>
                  <template #prefix>
                    <el-icon size="20px">
                      <message />
                    </el-icon>
                  </template>
                  <template #append>
                    <div
                      class="w-[50px] h-[30px] flex justify-center items-center leading-[30px] cursor-pointer text-[#00a1d6]"
                      :class="{ 'send-code-btn-disabled': sendCodeBtnDisabled }" @click.prevent="handleSendCode"
                      @mousedown.prevent="handleBtnMouseDown" tabindex="-1">
                      {{ countDown > 0 ? `${countDown}s后重试` : '获取验证码' }}
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </el-form>
          <div class="mt-[20px]">
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

:deep(.el-input__wrapper) {
  border-radius: 20px;
  height: 40px;
}


$border-color: #dcdfe6;
$border-color-hover: #c6cad1;
$border-color-focus: #f1844a;
$border-color-error: #f56c6c;

/** 输入框默认边框 */
:deep(.code-input .el-input__wrapper) {
  border-radius: 20px 0 0 20px;
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color inset,
    /** 底部边框 */
    0 1px 0 0 $border-color inset,
    /** 左侧边框 */
    1px 0 0 0 $border-color inset,
    /** 右侧阴影 */
    0 0 0 0 transparent;

  &.is-focus {
    box-shadow:
      /** 顶部边框 */
      0 -1px 0 0 $border-color-focus inset,
      /** 底部边框 */
      0 1px 0 0 $border-color-focus inset,
      /** 左侧边框 */
      1px 0 0 0 $border-color-focus inset,
      /** 右侧阴影 */
      0 0 0 0 transparent !important;
  }
}

/** append默认边框 */
:deep(.code-input .el-input-group__append) {
  background-color: transparent;
  border-radius: 0 20px 20px 0;
  padding: 0 20px;
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color inset,
    /** 底部边框 */
    0 1px 0 0 $border-color inset,
    /** 左侧边框 */
    0 0 0 0 transparent,
    /** 右侧阴影 */
    -1px 0 0 0 $border-color inset;
}

/** 输入框激活状态hover */
:deep(.code-form-item:not(.is-error) .code-input.el-input-group:hover .el-input__wrapper:not(.is-focus)) {
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color-hover inset,
    /** 底部边框 */
    0 1px 0 0 $border-color-hover inset,
    /** 左侧边框 */
    1px 0 0 0 $border-color-hover inset,
    /** 右侧阴影 */
    0 0 0 0 transparent;
}

/** append激活状态hover */
:deep(.code-form-item:not(.is-error) .code-input.el-input-group:hover .el-input-group__append:not(.is-focus + *)) {
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color-hover inset,
    /** 底部边框 */
    0 1px 0 0 $border-color-hover inset,
    /** 左侧边框 */
    0 0 0 0 transparent,
    /** 右侧阴影 */
    -1px 0 0 0 $border-color-hover inset;
}

:deep(.code-input .el-input__wrapper),
:deep(.code-input .el-input-group__append) {
  transition: box-shadow 0.1s ease; // 添加入场过渡
}

/** append聚焦状态 */
:deep(.code-form-item:not(.is-error) .code-input .el-input__wrapper.is-focus + .el-input-group__append) {
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color-focus inset,
    /** 底部边框 */
    0 1px 0 0 $border-color-focus inset,
    /** 左侧边框 */
    0 0 0 0 transparent,
    /** 右侧阴影 */
    -1px 0 0 0 $border-color-focus inset !important;
}

/** 输入框表单校验失败 */
:deep(.code-form-item.is-error .el-input__wrapper) {
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color-error inset,
    /** 底部边框 */
    0 1px 0 0 $border-color-error inset,
    /** 左侧边框 */
    1px 0 0 0 $border-color-error inset,
    /** 右侧阴影 */
    0 0 0 0 transparent !important;
}

:deep(.code-form-item.is-error .el-input-group__append) {
  box-shadow:
    /** 顶部边框 */
    0 -1px 0 0 $border-color-error inset,
    /** 底部边框 */
    0 1px 0 0 $border-color-error inset,
    /** 左侧边框 */
    0 0 0 0 transparent,
    /** 右侧阴影 */
    -1px 0 0 0 $border-color-error inset !important;
}

.send-code-btn-disabled {
  cursor: not-allowed;
  color: currentColor;
}

.login-btn {
  height: 40px;
}
</style>