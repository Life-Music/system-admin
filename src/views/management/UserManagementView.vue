<template>
  <div>
    <div class="text-2xl mb-4">Quản lý người dùng</div>
  </div>
  <div class="p-4 rounded-lg bg-white">
    <div class="text-lg my-2">Tìm kiếm: </div>
    <Form layout="vertical" :model="meta" @finish="onSearch">
      <div class="flex flex-wrap gap-x-8 items-end">
        <Form.Item name="id" label="Id">
          <Input v-model:value="meta.id" allow-clear />
        </Form.Item>
        <Form.Item name="username" label="Username">
          <Input v-model:value="meta.username" allow-clear />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input v-model:value="meta.email" allow-clear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" html-type="submit">Tìm kiếm</Button>
        </Form.Item>
      </div>
    </Form>
    <Table :data-source="dataSource" :loading="isLoading" :columns="columns" :pagination="{
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showQuickJumper: true,
      total: meta.total,
      current: meta.currentPage,
      pageSize: meta.pageSize,
      showTotal: (total, range) => `Total: ${total} items`,
      onChange: onChangePagination,
    }">
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'name'">
          <div class="flex gap-x-4 items-center">
            <Avatar :src="record.avatar" />
            <div>
              {{ record.firstName }} {{ record.lastName }}
            </div>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <DropdownButton trigger="click" arrow>
            <template #overlay>
              <Menu>
                <Menu.Item @click="editUser(record)">
                  Chỉnh sửa
                </Menu.Item>
              </Menu>
            </template>
            {{ $t('table.action') }}
          </DropdownButton>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </Table>
    <Modal v-model:open="isOpenModal" @ok="handleSubmitForm" :confirm-loading="isSubmitting">
        <Form :model="currentUser" layout="vertical" ref="formRef">
          <Form.Item name="email" label="Email" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
            <Input v-model:value="currentUser.email" />
          </Form.Item>
          <Form.Item name="username" label="Username" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
            <Input v-model:value="currentUser.username" />
          </Form.Item>
          <Form.Item name="firstName" label="Họ" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
            <Input v-model:value="currentUser.firstName" />
          </Form.Item>
          <Form.Item name="lastName" label="Tên" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
            <Input v-model:value="currentUser.lastName" />
          </Form.Item>
        </Form>
    </Modal>
  </div>
</template>
<script lang="ts" setup>
import requestInstance from '@/utils/axios';
import { Avatar, Button, Form, Input, Modal, Table, message, type FormInstance, DropdownButton, Menu } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { reactive, ref } from 'vue';
import type { Prisma } from '~/prisma/generated/mysql';

type DataSourceType = Prisma.UserGetPayload<{

}>

const isOpenModal = ref(false)
const isSubmitting = ref(false)
const formRef = ref<FormInstance>()
const currentUser = reactive({
  firstName: '',
  lastName: '',
  id: '',
  username: '',
  email: '',
})
const dataSource = ref<DataSourceType[]>()
const meta = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
  email: '',
  username: '',
  id: '',
})

const columns = ref<ColumnType[]>([
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Created at',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: '',
    dataIndex: 'action',
    key: 'action',
  }
])

const isLoading = ref(false)

const loadResource = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccessPagination<DataSourceType[]>>('/admin/management/user', {
    params: {
        take: meta.pageSize,
        page: meta.currentPage,
        id: meta.id,
        username: meta.username,
        email: meta.email,
      }
  })
  .finally(() => {
    isLoading.value = false
  })

  dataSource.value = res.data.data

  const { meta: metaData } = res.data

  meta.currentPage = metaData.current_page
  meta.pageSize = metaData.per_page
  meta.total = metaData.total_object
}

const onChangePagination = (page: number, pageSize: number) => {
  meta.currentPage = page
  meta.pageSize = pageSize
  loadResource()
}

const onSearch = () => {
  meta.currentPage = 1;
  loadResource()
}

const editUser = (record: any) => {
  currentUser.id = record.id
  currentUser.username = record.username
  currentUser.email = record.email
  currentUser.firstName = record.firstName
  currentUser.lastName = record.lastName
  isOpenModal.value = true
}

const handleSubmitForm = async () => {
  if(formRef.value) {
    await formRef.value.validateFields()
  }

  isSubmitting.value = true
    await requestInstance.patch(`/admin/management/user/${currentUser.id}`, currentUser)
    message.success('Cập nhật thành công!')

  isSubmitting.value = false
  isOpenModal.value = false
  loadResource()

}

loadResource()

</script>