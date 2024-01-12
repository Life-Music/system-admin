<template>
  <div>
    <div class="text-2xl mb-4">Quản lý hóa đơn</div>
  </div>
  <div class="p-4 rounded-lg bg-white">
    <div class="text-lg my-2">Tìm kiếm: </div>
    <Form layout="vertical" :model="meta" @finish="onSearch">
      <div class="flex flex-wrap gap-x-8 items-end">
        <Form.Item name="id" label="Id">
          <Input v-model:value="meta.id" allow-clear />
        </Form.Item>
        <Form.Item name="user_id" label="User id">
          <Input v-model:value="meta.user_id" allow-clear />
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
            {{ planInfo[record.lines.data[0].plan.product].name }}
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'recurring'">
          <div class="flex gap-x-4 items-center first-letter:uppercase">
            {{ record.lines.data[0].price.recurring.interval }}
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createdAt'">
          {{ formatDate(new Date(record.created * 1000)) }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag color="blue" v-if="record.status == 'draft' || record.status == 'open'">
            {{ record.status }}
          </Tag>
          <Tag color="error" v-else-if="record.status == 'uncollectible' || record.status == 'void'">
            {{ record.status }}
          </Tag>
          <Tag color="success" v-else>
            {{ record.status }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <DropdownButton trigger="click" arrow>
            <template #overlay>
              <Menu>
                <Menu.Item @click="openNewTab(record.hosted_invoice_url)">
                  Xem chi tiết
                </Menu.Item>
                <Menu.Item @click="openNewTab(record.invoice_pdf)">
                  Tải xuống hóa đơn
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
  </div>
</template>
<script lang="ts" setup>
import requestInstance from '@/utils/axios';
import { formatDate } from '@/utils/common';
import { planInfo } from '@/utils/plan';
import { Button, DropdownButton, Form, Input, Menu, Table, Tag } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { reactive, ref } from 'vue';

type DataSourceType = any

const dataSource = ref<DataSourceType[]>([])
const meta = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
  user_id: '',
  id: '',
})

const columns = ref<ColumnType[]>([
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Tên gói',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Gia hạn',
    dataIndex: 'recurring',
    key: 'recurring',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    fixed: 'right',
  },
])

const isLoading = ref(false)


const loadResource = async () => {
  isLoading.value = true
  const res = await requestInstance.get<ResponseSuccess<DataSourceType>>('/admin/management/invoices', {
    params: {
      user_id: meta.user_id,
      id: meta.id,
    },
  })
    .finally(() => {
      isLoading.value = false
    })

  dataSource.value = res.data.data.data

  meta.currentPage = 1
  meta.pageSize = 10
  meta.total = dataSource.value.length
}

const openNewTab = (url: string) => {
  window.open(url, '_blank')
}

const onChangePagination = (page: number, pageSize: number) => {
  meta.currentPage = page
  meta.pageSize = pageSize
}

const onSearch = () => {
  meta.currentPage = 1;
  loadResource()
}

loadResource()

</script>