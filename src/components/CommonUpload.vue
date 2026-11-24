<template>
  <div class="common_upload_item">
    <a-upload
      v-model:file-list="state.fileList"
      name="file"
      list-type="picture-card"
      :action="`${global.$getFileBaseUrl()}/upload2/`"
      :headers="{}"
      :disabled="props.disabled"
      :showUploadList="{
        showDownloadIcon: false,
      }"
      :maxCount="props.maxCount"
      @change="handleChangeAttachment"
      @remove="handleDeleteAttachment"
    >
      <div v-if="!props.maxCount || state.fileList.length < props.maxCount">
        <plus-outlined />
        <div style="margin-top: 8px">上传</div>
      </div>
      <template #itemRender="{ file, actions }">
        <div
          v-if="file.status === 'uploading'"
          class="loading"
        >
          <LoadingOutlined />
        </div>
        <div
          v-else
          class="filelist_wrapper"
        >
          <div v-if="global.$checkFileType(file.name) === 'image'">
            <a-image
              width="2.5rem"
              height="2.5rem"
              :src="getImgUrl(file)"
            />
            <a-button
              class="deletebutton"
              type="link"
              @click="actions.remove"
            >
              <DeleteOutlined />
            </a-button>
          </div>
          <div v-else-if="global.$checkFileType(file.name) === 'file'">
            <FileOutlined />
            <a-button
              class="deletebutton"
              type="link"
              @click="actions.remove"
            >
              <DeleteOutlined />
            </a-button>
          </div>
          <div v-else-if="global.$checkFileType(file.name) === 'pdf'">
            <FilePdfOutlined />
            <a-button
              class="deletebutton"
              type="link"
              @click="actions.remove"
            >
              <DeleteOutlined />
            </a-button>
          </div>
          <div v-else-if="global.$checkFileType(file.name) === 'video'">
            <VideoCameraOutlined />
            <a-button
              class="deletebutton"
              type="link"
              @click="actions.remove"
            >
              <DeleteOutlined />
            </a-button>
          </div>
        </div>
      </template>
    </a-upload>
  </div>
</template>

<script lang="tsx" setup>
import {
  reactive,
  watch,
  computed,
  onMounted,
  getCurrentInstance,
  ComponentInternalInstance,
  nextTick,
} from 'vue';
import {
  PlusOutlined,
  DeleteOutlined,
  FileOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
} from '@ant-design/icons-vue';
import type { UploadFile, UploadChangeParam } from 'ant-design-vue';

import { LoadingOutlined } from '@ant-design/icons-vue';

const emit = defineEmits<{
  (e: 'update:attachmentList', data: string | String[] | null): void;
  (e: 'change', data: UploadFile): void;
}>();

const props = defineProps({
  mode: { type: String, default: 'edit', required: false },
  title: { type: String, default: null, required: false },
  attachmentList: { type: [Array<String>, String, null], default: () => [] },
  disabled: { type: Boolean, default: false },
  maxCount: { type: Number, default: undefined },
});

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const state = reactive({
  fileList: [] as any[],
  initFlag: true,
  uploadingFlag: false,
});

const _modelValue = computed({
  get: () => {
    return props.attachmentList;
  },
  set: (val: string | string[] | null) => {
    emit('update:attachmentList', val);
  },
});

watch(
  () => props.attachmentList,
  (newValue: any, oldValue: any) => {
    if (newValue instanceof Array && oldValue instanceof Array) {
      if (oldValue.length > 0 && newValue.length === 0) {
        state.fileList = [];
        state.initFlag = true;
      } else if (newValue.length > 0 && !!state.initFlag) {
        // initFileList();
      }
    }
  },
  {
    deep: true,
  }
);

const checkUniView = (item: any) => {
  return item.createBy === 'uniview';
};

const getImgUrl = (item: any) => {
  const filePath = item.response?.filePath || item.filePath || item.url || '';
  if (!filePath) return '';

  // Upload responses may contain an absolute URL or a path that already has
  // the API prefix. Avoid prefixing those paths a second time in proxy mode.
  if (/^(https?:)?\/\//i.test(filePath)) return filePath;

  const baseUrl = global.$getFileBaseUrl().replace(/\/$/, '');
  const normalizedPath = filePath.replace(/^\/+/, '');
  const apiPrefix = baseUrl.split('/').pop();
  const path = normalizedPath.startsWith(`${apiPrefix}/`) || normalizedPath === apiPrefix
    ? `/${normalizedPath.slice(apiPrefix.length).replace(/^\/+/, '')}`
    : `/${normalizedPath}`;

  return `${baseUrl}${path}`;
};

const checkFileUrl = (item: any) => {
  let result: string;
  const fileType = global.$checkFileType(item.attachmentName);

  switch (fileType) {
    case 'file':
      result = global.$getImageUrl('/src/assets/file_icon.png');
      break;
    case 'video':
      result = global.$getImageUrl('/src/assets/file_icon.png');
      break;
    default:
      result = item.data;
      break;
  }
  return result;
};

const handleChangeAttachment = (value: UploadChangeParam, a, c) => {
  const response = value.file.response;

  if (value.file && response) {
    if (response.status === 200) {
      if (!(_modelValue.value instanceof Array)) {
        _modelValue.value = JSON.parse(JSON.stringify([]));
      }
      const fileIndex = state.fileList.length > 0 ? state.fileList.length - 1 : 0;
      state.fileList[fileIndex] = {
        response,
        ...state.fileList[fileIndex],
        ...{
          data: response.data,
          name: response.name,
        },
      };

      const fileInfo = {
        response,
        ...state.fileList[fileIndex],
        id: state.fileList[fileIndex].id,
        name: state.fileList[fileIndex].name,
        width: state.fileList[fileIndex].width,
        height: state.fileList[fileIndex].height,
        status: 'done',
        url: checkFileUrl(state.fileList[fileIndex]),
      };

      console.log(fileInfo);
      _modelValue.value.push(fileInfo);
      global.$message.success('上传成功');
      emit('change', fileInfo);
    } else {
      global.$message.error('上传失败');
    }
  }
};

const handleDeleteAttachment = (value: any) => {
  if (!value.deleteable && value.deleteable !== undefined) {
    global.$message.error('系统文件，无法删除');
    return;
  }

  let fileIndex: number = 0;
  state.fileList.forEach((item: any, index: number) => {
    if (item.uid === value.uid) {
      fileIndex = index;
      state.fileList.splice(fileIndex, 1);
    }
  });
};

const initFileList = () => {
  state.fileList = [];
  _modelValue.value.forEach((item: any, index: number) => {
    state.fileList.push({
      ...item,
      id: item.id,
      name: item.name,
      status: 'done',
      deleteable: !checkUniView(item),
      url: checkFileUrl(item),
    });
  });
  state.initFlag = false;
};

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    // initFileList();
  }, 500);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.common_upload_item {
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: 0 0.2rem;
  overflow: hidden;
  text-align: left;
  position: relative;

  .header {
    padding: 0.03rem 0.2.5rem;
    width: 100%;
    height: 0.3rem;
    font-size: 0.22rem;
    text-shadow: 0.02.5rem 0.02.5rem 0.02.5rem #000;
    background-image: linear-gradient(to right, rgba(68, 121, 255, 1), rgba(68, 121, 255, 0));
  }

  :deep(.ant-upload-list) {
    margin: 0.15rem 0 0 0;
    .ant-upload-list-item-container {
      display: inline-block;
      height: auto !important;
      border: 1px solid #00266f;
      border-radius: 0.2.5rem;
      &:hover {
        border: 1px solid #0059ff;
        transition: 0.3s all;
      }

      .loading {
        display: flex;
        width: 2.5rem;
        height: 2.5rem;
        line-height: 2.5rem;
        justify-content: center;
        font-size: 0.5rem;
      }
      .filelist_wrapper {
        width: 2.5rem;
        height: 2.5rem;
        > div {
          display: inline-flex;
          width: 100%;
          height: 100%;
          position: relative;
          align-items: center;
          justify-content: center;

          .anticon-file,
          .anticon-video-camera,
          .anticon-file-pdf {
            font-size: 1rem;
          }
          .deletebutton {
            height: 20px;
            padding: 0;
            position: absolute;
            right: 0;
            top: 0.1rem;
            .anticon {
              font-size: 0.5rem;
            }
          }
        }
      }
    }
  }
}
</style>
