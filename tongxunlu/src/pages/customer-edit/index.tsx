import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { Customer, CUSTOMER_LEVELS, CUSTOMER_SOURCES } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, generateId, formatDate } from '../../utils/storage';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.module.scss';

const CustomerEditPage: React.FC = () => {
  const router = useRouter();
  const customerId = router.params.id as string;
  const isEdit = !!customerId;

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    company: '',
    position: '',
    email: '',
    level: 'normal',
    source: 'internet',
    address: '',
    remark: '',
    nextFollowupAt: '',
  });

  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (isEdit) {
      console.log('[CustomerEdit] Loading existing customer:', customerId);
      const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
      const found = customers.find((c) => c.id === customerId);
      if (found) {
        setFormData(found);
      } else {
        Taro.showToast({ title: '客户不存在', icon: 'error' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    }
  }, [isEdit, customerId]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLevelSelect = (level: Customer['level']) => {
    setFormData((prev) => ({ ...prev, level }));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      Taro.showToast({ title: '请输入客户姓名', icon: 'none' });
      return false;
    }
    if (!formData.phone?.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);

    if (isEdit) {
      const updatedCustomers = customers.map((c) =>
        c.id === customerId
          ? { ...c, ...formData, updatedAt: now }
          : c
      );
      setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name: formData.name!.trim(),
        phone: formData.phone!.trim(),
        company: formData.company?.trim() || '',
        position: formData.position?.trim() || '',
        email: formData.email?.trim() || '',
        level: formData.level || 'normal',
        source: formData.source || 'other',
        status: 'active',
        address: formData.address?.trim() || '',
        remark: formData.remark?.trim() || '',
        createdAt: now,
        updatedAt: now,
        lastFollowupAt: '',
        nextFollowupAt: formData.nextFollowupAt || '',
      };
      setStorage(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...customers]);
      Taro.showToast({ title: '创建成功', icon: 'success' });
    }

    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    const followups = getStorage(STORAGE_KEYS.FOLLOWUPS, []);

    const updatedCustomers = customers.filter((c) => c.id !== customerId);
    const updatedFollowups = (followups as any[]).filter((f) => f.customerId !== customerId);

    setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setStorage(STORAGE_KEYS.FOLLOWUPS, updatedFollowups);

    setDeleteModal(false);
    Taro.showToast({ title: '删除成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const sourceOptions = CUSTOMER_SOURCES.map((s) => s.label);

  return (
    <View className={styles.page}>
      <View className={styles.form}>
        <View className={styles.formSection}>
          <Text className={styles.formSectionTitle}>基本信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>姓名
            </Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入客户姓名"
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>手机号
            </Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入手机号"
              value={formData.phone}
              onInput={(e) => handleInputChange('phone', e.detail.value)}
              type="number"
              maxlength={11}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>公司</Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入公司名称"
              value={formData.company}
              onInput={(e) => handleInputChange('company', e.detail.value)}
              maxlength={100}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>职位</Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入职位"
              value={formData.position}
              onInput={(e) => handleInputChange('position', e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>邮箱</Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入邮箱地址"
              value={formData.email}
              onInput={(e) => handleInputChange('email', e.detail.value)}
              maxlength={100}
            />
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.formSectionTitle}>客户属性</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>客户等级</Text>
          </View>
          <View className={styles.formRow}>
            {CUSTOMER_LEVELS.map((level) => (
              <View
                key={level.value}
                className={classnames(
                  styles.levelTag,
                  styles[`level${level.value.charAt(0).toUpperCase() + level.value.slice(1)}`],
                  formData.level === level.value && styles.active
                )}
                onClick={() => handleLevelSelect(level.value as Customer['level'])}
              >
                <Text className={styles.levelTagText}>{level.label}</Text>
              </View>
            ))}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>客户来源</Text>
            <Picker
              mode="selector"
              range={sourceOptions}
              value={CUSTOMER_SOURCES.findIndex((s) => s.value === formData.source)}
              onChange={(e) => {
                const index = parseInt(e.detail.value);
                handleInputChange('source', CUSTOMER_SOURCES[index].value);
              }}
            >
              <View className={styles.pickerValue}>
                <Text className={classnames(!formData.source && styles.pickerPlaceholder)}>
                  {CUSTOMER_SOURCES.find((s) => s.value === formData.source)?.label || '请选择来源'}
                </Text>
              </View>
            </Picker>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>下次跟进</Text>
            <Picker
              mode="date"
              value={formData.nextFollowupAt?.split('T')[0] || ''}
              onChange={(e) => handleInputChange('nextFollowupAt', new Date(e.detail.value).toISOString())}
            >
              <View className={styles.pickerValue}>
                <Text className={classnames(!formData.nextFollowupAt && styles.pickerPlaceholder)}>
                  {formData.nextFollowupAt
                    ? formatDate(formData.nextFollowupAt, 'YYYY-MM-DD')
                    : '请选择日期'}
                </Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className={styles.formSection}>
          <Text className={styles.formSectionTitle}>其他信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>地址</Text>
            <Input
              className={classnames(styles.formInput, styles.formInputLeft)}
              placeholder="请输入详细地址"
              value={formData.address}
              onInput={(e) => handleInputChange('address', e.detail.value)}
              maxlength={200}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注</Text>
          </View>
          <View className={styles.formItem}>
            <Textarea
              className={styles.textarea}
              placeholder="请输入备注信息..."
              value={formData.remark}
              onInput={(e) => handleInputChange('remark', e.detail.value)}
              maxlength={500}
              autoHeight
            />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        {isEdit ? (
          <>
            <Button className={classnames(styles.btn, styles.btnCancel)} onClick={handleCancel}>
              返回
            </Button>
            <Button className={classnames(styles.btn, styles.btnDelete)} onClick={handleDelete}>
              删除
            </Button>
            <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSave}>
              保存
            </Button>
          </>
        ) : (
          <>
            <Button className={classnames(styles.btn, styles.btnCancel)} onClick={handleCancel}>
              取消
            </Button>
            <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSave}>
              创建
            </Button>
          </>
        )}
      </View>

      <ConfirmModal
        visible={deleteModal}
        title="确认删除"
        content="确定要删除该客户吗？相关的跟进记录也会被删除。"
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </View>
  );
};

export default CustomerEditPage;
