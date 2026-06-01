<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.memberCount }}</div>
            <div class="stat-label">会员总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67C23A">
            <el-icon :size="28"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.bookCount }}</div>
            <div class="stat-label">图书总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #E6A23C">
            <el-icon :size="28"><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.borrowingCount }}</div>
            <div class="stat-label">借出中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #F56C6C">
            <el-icon :size="28"><Menu /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.categoryCount }}</div>
            <div class="stat-label">图书分类</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>最近借阅记录</span></template>
          <el-table :data="recentBorrows" stripe size="small">
            <el-table-column prop="member.name" label="会员" width="100" />
            <el-table-column prop="book.title" label="图书" />
            <el-table-column prop="borrowDate" label="借阅日期" width="120" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'warning' : 'success'" size="small">
                  {{ row.status === 1 ? '借出' : '已还' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>快捷操作</span></template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="$router.push('/member')">管理会员</el-button>
            <el-button type="success" size="large" @click="$router.push('/book')">管理图书</el-button>
            <el-button type="warning" size="large" @click="$router.push('/borrow')">借还操作</el-button>
            <el-button size="large" @click="$router.push('/category')">图书分类</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Reading, Tickets, Menu } from '@element-plus/icons-vue'
import { getMemberList } from '../api/member'
import { getBookList } from '../api/book'
import { getCategoryList } from '../api/category'
import { getBorrowList } from '../api/borrow'

const stats = ref({
  memberCount: 0,
  bookCount: 0,
  borrowingCount: 0,
  categoryCount: 0
})
const recentBorrows = ref([])

onMounted(async () => {
  try {
    const [members, books, categories, borrows] = await Promise.all([
      getMemberList(),
      getBookList(),
      getCategoryList(),
      getBorrowList()
    ])
    stats.value.memberCount = members.data.length
    stats.value.bookCount = books.data.length
    stats.value.categoryCount = categories.data.length
    stats.value.borrowingCount = borrows.data.filter(b => b.status === 1).length
    recentBorrows.value = borrows.data.slice(0, 8)
  } catch (e) {
    // handled by interceptor
  }
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.quick-actions .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}
</style>
