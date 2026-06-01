<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="keyword" placeholder="搜索会员姓名/编号/电话" clearable style="width: 260px"
            @keyup.enter="loadData" @clear="loadData">
            <template #append>
              <el-button @click="loadData">搜索</el-button>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="handleAdd">新增会员</el-button>
      </div>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="memberNo" label="会员编号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="registerDate" label="注册日期" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewBorrowRecords(row)">借阅记录</el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="会员编号" prop="memberNo">
          <el-input v-model="form.memberNo" placeholder="请输入会员编号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="borrowDialogVisible" title="会员借阅记录" width="800px" destroy-on-close>
      <div style="margin-bottom: 12px; font-weight: bold; color: #409EFF">
        会员：{{ currentMember.name }}（{{ currentMember.memberNo }}）
      </div>
      <el-table :data="borrowRecords" stripe border size="small">
        <el-table-column prop="book.title" label="图书名称" />
        <el-table-column prop="book.author" label="作者" width="100" />
        <el-table-column prop="borrowDate" label="借阅日期" width="120" />
        <el-table-column prop="dueDate" label="应还日期" width="120" />
        <el-table-column prop="returnDate" label="归还日期" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'warning' : 'success'" size="small">
              {{ row.status === 1 ? '借出' : '已还' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="danger" size="small" @click="handleReturn(row)">
              归还
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMemberList, addMember, updateMember, deleteMember } from '../api/member'
import { getBorrowByMember, returnBook } from '../api/borrow'

const keyword = ref('')
const tableData = ref([])
const dialogVisible = ref(false)
const borrowDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const currentMember = ref({})
const borrowRecords = ref([])

const defaultForm = {
  id: null,
  memberNo: '',
  name: '',
  phone: '',
  email: '',
  status: 1,
  remark: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  memberNo: [{ required: true, message: '请输入会员编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const res = await getMemberList(keyword.value)
    tableData.value = res.data
  } catch (e) { }
}

const handleAdd = () => {
  Object.assign(form, { ...defaultForm })
  dialogTitle.value = '新增会员'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, { ...row })
  dialogTitle.value = '编辑会员'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (form.id) {
      await updateMember(form)
    } else {
      await addMember(form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该会员吗？', '提示', { type: 'warning' })
    await deleteMember(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { }
}

const viewBorrowRecords = async (row) => {
  currentMember.value = row
  borrowDialogVisible.value = true
  try {
    const res = await getBorrowByMember(row.id)
    borrowRecords.value = res.data
  } catch (e) { }
}

const handleReturn = async (row) => {
  try {
    await ElMessageBox.confirm('确定归还该图书吗？', '提示', { type: 'warning' })
    await returnBook(row.id)
    ElMessage.success('归还成功')
    const res = await getBorrowByMember(currentMember.value.id)
    borrowRecords.value = res.data
    loadData()
  } catch (e) { }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}
</style>
