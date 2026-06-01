<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-radio-group v-model="statusFilter" @change="loadData">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="1">借出中</el-radio-button>
            <el-radio-button :label="2">已归还</el-radio-button>
          </el-radio-group>
        </div>
        <el-button type="primary" @click="showBorrowDialog">新增借阅</el-button>
      </div>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="member.memberNo" label="会员编号" width="110" />
        <el-table-column prop="member.name" label="会员姓名" width="100" />
        <el-table-column prop="book.bookNo" label="图书编号" width="110" />
        <el-table-column prop="book.title" label="图书名称" />
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
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="danger" size="small" @click="handleReturn(row)">
              归还
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="borrowDialogVisible" title="新增借阅" width="500px" destroy-on-close>
      <el-form ref="borrowFormRef" :model="borrowForm" :rules="borrowRules" label-width="90px">
        <el-form-item label="选择会员" prop="memberId">
          <el-select v-model="borrowForm.memberId" placeholder="请选择会员" filterable style="width: 100%">
            <el-option v-for="m in members" :key="m.id" :label="`${m.memberNo} - ${m.name}`" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择图书" prop="bookId">
          <el-select v-model="borrowForm.bookId" placeholder="请选择图书" filterable style="width: 100%">
            <el-option v-for="b in availableBooks" :key="b.id" :label="`${b.bookNo} - ${b.title}`" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="借阅天数" prop="days">
          <el-input-number v-model="borrowForm.days" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="borrowForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBorrow">确认借出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBorrowList, borrowBook, returnBook } from '../api/borrow'
import { getMemberList } from '../api/member'
import { getBookList } from '../api/book'

const statusFilter = ref(null)
const tableData = ref([])
const members = ref([])
const books = ref([])
const borrowDialogVisible = ref(false)
const borrowFormRef = ref(null)

const borrowForm = reactive({
  memberId: null,
  bookId: null,
  days: 30,
  remark: ''
})

const borrowRules = {
  memberId: [{ required: true, message: '请选择会员', trigger: 'change' }],
  bookId: [{ required: true, message: '请选择图书', trigger: 'change' }],
  days: [{ required: true, message: '请输入借阅天数', trigger: 'blur' }]
}

const availableBooks = computed(() => {
  return books.value.filter(b => b.availableStock > 0 && b.status === 1)
})

const loadData = async () => {
  try {
    const res = await getBorrowList(statusFilter.value)
    tableData.value = res.data
  } catch (e) { }
}

const loadMembersAndBooks = async () => {
  try {
    const [mRes, bRes] = await Promise.all([getMemberList(), getBookList()])
    members.value = mRes.data.filter(m => m.status === 1)
    books.value = bRes.data
  } catch (e) { }
}

const showBorrowDialog = () => {
  borrowForm.memberId = null
  borrowForm.bookId = null
  borrowForm.days = 30
  borrowForm.remark = ''
  borrowDialogVisible.value = true
}

const handleBorrow = async () => {
  const valid = await borrowFormRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    await borrowBook(borrowForm)
    ElMessage.success('借阅成功')
    borrowDialogVisible.value = false
    loadData()
  } catch (e) { }
}

const handleReturn = async (row) => {
  try {
    await ElMessageBox.confirm('确定归还该图书吗？', '提示', { type: 'warning' })
    await returnBook(row.id)
    ElMessage.success('归还成功')
    loadData()
  } catch (e) { }
}

onMounted(() => {
  loadData()
  loadMembersAndBooks()
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
