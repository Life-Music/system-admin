<template>
  <div class="w-full max-w-lg p-8 rounded-lg border shadow-md">
    <div class="flex gap-x-4 justify-center items-center my-4">
      <img src="/images/logo.png" class="w-16 h-16" />
      <div class="uppercase text-3xl tracking-widest font-sans">Login</div>
    </div>
    <Form layout="vertical" :model="formState" @finish="onFinish">
      <FormItem label="Username" name="username" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
        <Input v-model:value="formState.username" />
      </FormItem>
      <FormItem label="Password" name="password" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
        <Input type="password" v-model:value="formState.password" />
      </FormItem>
      <FormItem name="remember">
        <Checkbox>Remember me</Checkbox>
      </FormItem>
      <Button type="primary" html-type="submit">Đăng nhập</Button>
    </Form>
  </div>
</template>
<script setup lang="ts">
import routerNames from '@/router/routerNames';
import requestInstance from '@/utils/axios';
import { Button, Checkbox, Form, FormItem, Input } from 'ant-design-vue';
import { ref } from 'vue';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const formState = reactive({
  username: '',
  password: '',
})
const router = useRouter()

const isLoading = ref(false)

const onFinish = async () => {
  isLoading.value = true
  const res = await requestInstance.post<ResponseSuccess<{
        token: string;
        user: any;
      }>>('/admin/login', formState)
  .finally(() => {
    isLoading.value = false
  })

  if (res.data.success) {
    localStorage.setItem("admin_access_token", res.data.data.token);
    router.push({
      name: routerNames.HOME,
    });
}
}
</script>