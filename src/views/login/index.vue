<template>
  <div class="w-full min-w-[800px] relative">
    <div class="absolute inset-0 login-bg bg-no-repeat bg-cover bg-center"></div>
    <div class="relative min-h-[100vh] flex justify-end items-center px-[8%] py-[4%]">
      <div class="w-[30%] min-w-[360px] min-h-[600px] rounded-2xl px-[34px] py-[50px] bg-white">
        <!-- 标题 -->
        <div class="truncate">
          <div class="font-semibold text-3xl">欢迎登录</div>
          <span class="font-comic font-semibold text-4xl text-orange-500">Uru</span>
          <span class="font-semibold text-2xl">芳华帖后台管理</span>
        </div>
        <div class="px-[4px]">
          <div class="mt-[40px] flex items-center">
            <div class="max-w-[180px] truncate">专业服务团队！</div>
            <div class="ml-[20px]">
              <el-button type="primary" round>员工须知</el-button>
            </div>
          </div>
          <!-- 登录表单 -->
          <div class="mt-[60px]">
            <div class="grid gap-y-[16px] login-form">
              <el-input placeholder="账号" clearable></el-input>
              <el-input placeholder="密码" clearable></el-input>
            </div>
            <div class="mt-[20px]">
              <el-button class="w-full login-btn" type="primary" round>登 录</el-button>
            </div>
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

:deep(.el-input__wrapper) {
  border-radius: 20px;
  height: 40px;
}

.login-btn {
  height: 40px;
}
</style>