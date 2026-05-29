import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Input, Textarea, Button, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { Customer, Followup, FOLLOWUP_TYPES } from '../../types';
import { getStorage, setStorage, STORAGE_KEYS, generateId, formatDate } from '../../utils/storage';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './index.module.scss';

const FollowupEditPage: React.FC = () => {
  const router = useRouter();
  const followupId = router.params.id as string;
  const initialCustomerId = router.params.customerId as string;
  const initialCustomerName = decodeURIComponent(router.params.customerName || '');
  const isEdit = !!followupId;

  const [formData, setFormData] = useState<Partial<Followup>>({
    customerId: initialCustomerId || '',
    customerName: initialCustomerName || '',
    type: 'call',
    content: '',
    result: '',
    followupAt: new Date().toISOString(),
    nextFollowupAt: '',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    const storedCustomers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    setCustomers(storedCustomers);

    if (isEdit) {
      console.log('[FollowupEdit] Loading existing followup:', followupId);
      const followups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);
      const found = followups.find((f) => f.id === followupId);
      if (found) {
        setFormData(found);
      } else {
        Taro.showToast({ title: '记录不存在', icon: 'error' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    }
  }, [isEdit, followupId, initialCustomerId, initialCustomerName]);

  const customerNames = useMemo(() => customers.map((c) => c.name), [customers]);
  const selectedCustomerIndex = useMemo(
    () => customers.findIndex((c) => c.id === formData.customerId),
    [customers, formData.customerId]
  );

  const handleInputChange = (field: keyof Followup, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: Followup['type']) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleCustomerSelect = (e: any) => {
    const index = parseInt(e.detail.value);
    if (index >= 0 && index < customers.length) {
      const customer = customers[index];
      setFormData((prev) => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.customerId) {
      Taro.showToast({ title: '请选择客户', icon: 'none' });
      return false;
    }
    if (!formData.content?.trim()) {
      Taro.showToast({ title: '请输入跟进内容', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const followups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);
    const customers = getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);

    if (isEdit) {
      const updatedFollowups = followups.map((f) =>
        f.id === followupId
          ? { ...f, ...formData, updatedAt: now }
          : f
      );
      setStorage(STORAGE_KEYS.FOLLOWUPS, updatedFollowups);

      const updatedCustomers = customers.map((c) =>
        c.id === formData.customerId
          ? {
              ...c,
              lastFollowupAt: formData.followupAt || now,
              nextFollowupAt: formData.nextFollowupAt || c.nextFollowupAt,
              updatedAt: now,
            }
          : c
      );
      setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

      Taro.showToast({ title: '保存成功', icon: 'success' });
    } else {
      const newFollowup: Followup = {
        id: generateId(),
        customerId: formData.customerId!,
        customerName: formData.customerName!,
        type: formData.type || 'call',
        content: formData.content!.trim(),
        result: formData.result?.trim() || '',
        followupAt: formData.followupAt || now,
        nextFollowupAt: formData.nextFollowupAt || '',
        createdAt: now,
        updatedAt: now,
      };
      setStorage(STORAGE_KEYS.FOLLOWUPS, [newFollowup, ...followups]);

      const updatedCustomers = customers.map((c) =>
        c.id === formData.customerId
          ? {
              ...c,
              lastFollowupAt: formData.followupAt || now,
              nextFollowupAt: formData.nextFollowupAt || c.nextFollowupAt,
              updatedAt: now,
            }
          : c
      );
      setStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

      Taro.showToast({ title: '创建成功', icon: 'success' });
    }

    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    const followups = getStorage<Followup[]>(STORAGE_KEYS.FOLLOWUPS, []);
    const updatedFollowups = followups.filter((f) => f.id !== followupId);
    setStorage(STORAGE_KEYS.FOLLOWUPS, updatedFollowups);

    setDeleteModal(false);
    Taro.showToast({ title: '删除成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.form}>
        {!isEdit && initialCustomerId && (
          <View className={styles.customerInfo}>
            <Text className={styles.customerName}>{initialCustomerName}</Text>
            <Text className={styles.customerDesc}>
              正在为该客户记录跟进
            </Text>
          </View>
        )}

        <View className={styles.formSection}>
          <Text className={styles.formSectionTitle}>跟进信息</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>客户
            </Text>
            {!initialCustomerId ? (
              <Picker
                mode="selector"
                range={customerNames}
                value={selectedCustomerIndex >= 0 ? selectedCustomerIndex : 0}
                onChange={handleCustomerSelect}
              >
                <View className={styles.pickerValue}>
                  <Text className={classnames(!formData.customerId && styles.pickerPlaceholder)}>
                    {formData.customerName || '请选择客户'}
                  </Text>
                </View>
              </Picker>
            ) : (
              <Picker
                mode="selector"
                range={customerNames}
                value={selectedCustomerIndex >= 0 ? selectedCustomerIndex : 0}
                onChange={handleCustomerSelect}
              >
                <View className={styles.customerPicker}>
                  <Text className={styles.changeCustomer}>更换客户</Text>
                </View>
              </Picker>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>跟进方式
            </Text>
          </View>
          <View className={styles.typeTags}>
            {FOLLOWUP_TYPES.map((type) => (
              <View
                key={type.value}
                className={classnames(styles.typeTag, formData.type === type.value && styles.active)}
                onClick={() => handleTypeSelect(type.value as Followup['type'])}
              >
                <Text className={styles.typeTagText}>{type.label}</Text>
              </View>
            ))}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>跟进时间</Text>
            <Picker
              mode="date"
              value={formData.followupAt?.split('T')[0] || ''}
              onChange={(e) => handleInputChange('followupAt', new Date(e.detail.value).toISOString())}
            >
              <View className={styles.pickerValue}>
                <Text className={classnames(!formData.followupAt && styles.pickerPlaceholder)}>
                  {formData.followupAt
                    ? formatDate(formData.followupAt, 'YYYY-MM-DD')
                    : '请选择日期'}
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
          <Text className={styles.formSectionTitle}>跟进内容</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.required}>*</Text>内容
            </Text>
          </View>
          <View className={styles.formItem}>
            <Textarea
              className={styles.textarea}
              placeholder="请详细描述本次跟进的内容..."
              value={formData.content}
              onInput={(e) => handleInputChange('content', e.detail.value)}
              maxlength={1000}
              autoHeight
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>结果</Text>
          </View>
          <View className={styles.formItem}>
            <Textarea
              className={styles.textarea}
              placeholder="请描述本次跟进的结果或客户反馈..."
              value={formData.result}
              onInput={(e) => handleInputChange('result', e.detail.value)}
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
              保存
            </Button>
          </>
        )}
      </View>

      <ConfirmModal
        visible={deleteModal}
        title="确认删除"
        content="确定要删除这条跟进记录吗？"
        confirmText="删除"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </View>
  );
};

export default FollowupEditPage;
