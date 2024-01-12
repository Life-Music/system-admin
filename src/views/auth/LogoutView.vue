<template>
  <div>
  </div>
</template>
<script setup lang="ts">
import routerNames from '@/router/routerNames';
import { useRouter } from 'vue-router';

const router = useRouter()
localStorage.removeItem("admin_access_token")

router.push({
  name: routerNames.LOGIN,
})
</script>
