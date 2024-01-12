<template>
  <div class="flex justify-between">
    <div class="text-2xl mb-4">Quản lý chủ đề</div>
    <Button type="primary" @click="editCategory({
      name: '',
      hot: false,
    })">Tạo mới</Button>
  </div>
  <div class="p-4 rounded-lg bg-white">
    <div class="text-lg my-2">Tìm kiếm: </div>
    <Form layout="vertical" :model="meta" @finish="onSearch">
      <div class="flex flex-wrap gap-x-8 items-end">
        <Form.Item name="id" label="Id">
          <Input v-model:value="meta.id" allow-clear />
        </Form.Item>
        <Form.Item name="name" label="Tên chủ đề">
          <Input v-model:value="meta.name" allow-clear />
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
        <template v-if="column.dataIndex === 'number_of_song'">
          {{ formatNumber(record._count.categoryOnMedia) }}
        </template>
        <template v-else-if="column.dataIndex === 'hot'">
          <Tag v-if="record.hot" color="success">
            Nổi bật
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <DropdownButton trigger="click" arrow>
            <template #overlay>
              <Menu>
                <Menu.Item @click="editCategory(record)">
                  Chỉnh sửa
                </Menu.Item>
                <Menu.Item danger @click="deleteCategory(record)">
                  Xóa
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
        <Form :model="currentCategory" layout="vertical" ref="formRef">
          <Form.Item name="name" label="Tên chủ đề" :rules="[{ required: true, message: 'Vui lòng không được để trống!' }]">
            <Input v-model:value="currentCategory.name" />
          </Form.Item>
          <Form.Item name="hot">
            <Checkbox v-model:checked="currentCategory.hot">
              Nổi bật
            </Checkbox>
          </Form.Item>
        </Form>
    </Modal>
  </div>
</template>
<script lang="ts" setup>
import requestInstance from '@/utils/axios';
import { formatNumber } from '@/utils/common';
import { Button, DropdownButton, Form, Input, Menu, Modal, Table, type FormInstance, Checkbox, message, Tag } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { reactive } from 'vue';
import { createVNode } from 'vue';
import { ref } from 'vue';
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import type { Prisma } from '~/prisma/generated/mysql';

type DataSourceType = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: {
        categoryOnMedia: true,
      }
    },
  }
}>

const isOpenModal = ref(false)
const isSubmitting = ref(false)
const dataSource = ref<DataSourceType[]>()
const meta = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
  name: '',
  id: '',
})

const formRef = ref<FormInstance>()

const currentCategory = reactive({
  name: '',
  hot: false,
  id: '',
})

const columns = ref<ColumnType[]>([
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Nổi bật',
    dataIndex: 'hot',
    key: 'hot',
  },
  {
    title: 'Số lượng bài hát',
    dataIndex: 'number_of_song',
    key: 'number_of_song',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: '',
    dataIndex: 'action',
    key: 'action',
  },
])

const isLoading = ref(false)

const loadResource = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccessPagination<DataSourceType[]>>('/admin/management/category', {
    params: {
        take: meta.pageSize,
        page: meta.currentPage,
        id: meta.id,
        name: meta.name,
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

const editCategory = (record: any) => {
  isOpenModal.value = true
  currentCategory.name = record.name
  currentCategory.id = record.id
  currentCategory.hot = record.hot
}

const deleteCategory = (record: any) => {
  Modal.confirm({
    title: 'Xác nhận hành động',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'Bạn có chắc muốn xóa chủ đề này?',
    onOk: async () => {
      await requestInstance.delete<ResponseSuccess<any | null>>(`/admin/management/category/${record.id}`)
      message.success('Xóa thành công!')
      loadResource()
    }
  });
}

const handleSubmitForm = async () => {
  if(formRef.value) {
    await formRef.value.validateFields()
  }

  isSubmitting.value = true
  if(currentCategory.id) {
    await requestInstance.patch(`/admin/management/category/${currentCategory.id}`, currentCategory)
    message.success('Cập nhật thành công!')
  }
  else {
    await requestInstance.post(`/admin/management/category`, currentCategory)
    message.success('Tạo mới thành công!')
  }

  isSubmitting.value = false
  isOpenModal.value = false
  loadResource()

}

const onSearch = () => {
  meta.currentPage = 1;
  loadResource()
}

loadResource()


</script>