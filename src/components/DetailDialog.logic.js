import sportApi from '@/api/Function_Menu';

export default {
  name: 'DetailDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    detailInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      fullDetail: { ...this.detailInfo }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.fetchDetail();
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    async fetchDetail() {
      if (!this.detailInfo || !this.detailInfo.sportType) return;
      this.loading = true;
      try {
        const res = await sportApi.DetailInfo(this.detailInfo.sportType);
        // 合并原有基础数据与后端返回的详细数据
        this.fullDetail = { ...this.detailInfo, ...res.data };
      } catch (e) {
        this.$message.error('获取详情失败');
      } finally {
        this.loading = false;
      }
    }
  }
};
