<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="keyword" placeholder="搜索书名/作者/编号" clearable style="width: 260px"
            @keyup.enter="loadData" @clear="loadData">
            <template #append>
              <el-button @click="loadData">搜索</el-button>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="handleAdd">新增图书</el-button>
      </div>

      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="bookNo" label="图书编号" width="120" />
        <el-table-column prop="title" label="书名" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="publisher" label="出版社" width="130" />
        <el-table-column prop="category.name" label="分类" width="100" />
        <el-table-column prop="totalStock" label="总库存" width="80" />
        <el-table-column prop="availableStock" label="可借" width="80">
          <template #default="{ row }">
            <el-tag :type="row.availableStock > 0 ? 'success' : 'danger'" size="small">
              {{ row.availableStock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '在库' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="图书编号" prop="bookNo">
          <el-input v-model="form.bookNo" placeholder="请输入图书编号" />
        </el-form-item>
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="form.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="form.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="总库存" prop="totalStock">
          <el-input-number v-model="form.totalStock" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在库</el-radio>
            <el-radio :label="0">下架</el-radio>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookList, addBook, updateBook, deleteBook } from '../api/book'
import { getCategoryList } from '../api/category'

const keyword = ref('')
const tableData = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const defaultForm = {
  id: null,
  bookNo: '',
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  categoryId: null,
  totalStock: 1,
  status: 1,
  remark: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  bookNo: [{ required: true, message: '请输入图书编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  totalStock: [{ required: true, message: '请输入总库存', trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const res = await getBookList(keyword.value)
    tableData.value = res.data
  } catch (e) { }
}

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    categories.value = res.data
  } catch (e) { }
}

const handleAdd = () => {
  Object.assign(form, { ...defaultForm })
  dialogTitle.value = '新增图书'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    ...row,
    categoryId: row.category ? row.category.id : null
  })
  dialogTitle.value = '编辑图书'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const submitData = { ...form }
    if (!submitData.id) {
      submitData.availableStock = submitData.totalStock
    }
    if (submitData.id) {
      await updateBook(submitData)
    } else {
      await addBook(submitData)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该图书吗？', '提示', { type: 'warning' })
    await deleteBook(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) { }
}

onMounted(() => {
  loadData()
  loadCategories()
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
