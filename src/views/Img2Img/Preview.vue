<template>
  <div class="preview_container">
    <el-scrollbar
      class="preview_wrapper"
      height="100%"
      ref="scrollbarRef"
    >
    {{ props.image }}
      <InpaintButtonSDXL
        :image="props.image"
        :mask="props.mask"
        :positivePrompt="props.positivePrompt"
        :customPositivePrompt="props.customPositivePrompt"
        :negativePrompt="props.negativePrompt"
        :customNegativePrompt="props.customNegativePrompt"
        :width="props.width"
        :height="props.height"
        :useNegativePrompt="props.useNegativePrompt"
        :useRefiner="props.useRefiner"
        :useFp32="props.useFp32"
        :useLcmLora="props.useLcmLora"
        :sampler="props.sampler"
        :setSeed="props.setSeed"
        :settings="props.settings"
      />

      <div class="preview">
        <a-image
          v-if="global.$isNotEmpty(previewingImage)"
          :src="previewingImage"
          fit="contain"
          @click="handleOpenImagePreviewDialog"
        >
          <template #error>
            <el-icon>
              <Picture />
            </el-icon>
          </template>
        </a-image>
        <a-button
          v-if="!!previewingImage"
          class="applythisseed"
          @click="handleToggleApplySeed"
        >
          采用此种子
        </a-button>
      </div>
      <a-row
        class="operation"
        justify="space-between"
      >
        <a-col :span="24">
          <a-button
            type="primary"
            @click="handleSaveImage"
          >
            保存到图集
          </a-button>
        </a-col>
      </a-row>
    </el-scrollbar>
    <div class="previewlist_wrapper">
      <h1>暂存区</h1>
      <el-scrollbar>
        <ul>
          <li
            v-for="(item, index) in currentPreviewList"
            :key="index"
            :class="{ active: item.active, saved: item.saved }"
            @click="handleChoosePreview(index)"
          >
            <div
              v-if="item.generationStatus === 'generating'"
              class="generating"
            >
              <a-spin :indicator="indicator" />
            </div>
            <div
              v-else-if="item.generationStatus === 'queueing'"
              class="generating"
            >
              <a-spin />
            </div>
            <a-image
              v-else-if="item.generationStatus === 'generated'"
              width="100%"
              height="100%"
              :src="item.base64Data"
            >
            </a-image>

            <el-icon
              v-if="item.saved"
              class="savedicon"
              color="#fff"
            >
              <StarFilled />
            </el-icon>
            <div
              v-if="item.generationStatus === 'generated'"
              class="operation"
            >
              <a
                href="javascript:;"
                @click.stop="handleDeletePreview(index)"
              >
                <el-icon color="#fff">
                  <Delete />
                </el-icon>
              </a>
            </div>
          </li>
        </ul>
      </el-scrollbar>
    </div>
    <DialogPreviewImage
      :previewVisible="state.previewImageVisible"
      :imageUrl="previewDialogData"
      @onCloseDialog="handleClosePreviewImageDialog"
    />
  </div>
</template>

<script lang="tsx" setup>
import DialogPreviewImage from '@/components/DialogPreviewImage.vue';
import InpaintButtonSDXL from './InpaintButtonSDXL.vue';

import {
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  ComponentInternalInstance,
  ref,
  nextTick,
  h,
} from 'vue';

import { LoadingOutlined } from '@ant-design/icons-vue';
import { Picture } from '@element-plus/icons-vue';

import {
  saveImageToAlbumRequest,
  getCancellingProgressSDXLRequest,
  getGenerationStatusSDXLRequest,
} from '@/api/sdxl';
import { checkQueueByUserIdRequest, deleteQueueRequest, addQueueRequest } from '@/api/common';
import { MouseEventHandler } from 'ant-design-vue/es/_util/EventInterface';

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const chatScrollbarRef = ref(HTMLDivElement);
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const loading = ref(true);

interface Props {
  image?: string;
  mask?: string;
  width: number;
  height: number;
  positivePrompt?: string;
  negativePrompt?: string;
  customPositivePrompt?: string;
  customNegativePrompt?: string;
  settings?: any;
  useNegativePrompt?: boolean;
  useRefiner?: boolean;
  useFp32?: boolean;
  useLcmLora?: boolean;
  sampler?: string;
  setSeed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  image: '',
  mask: '',
  width: 0,
  height: 0,
  positivePrompt: '',
  customPositivePrompt: '',
  negativePrompt: '',
  customNegativePrompt: '',
  settings: {} as any,
  useNegativePrompt: false,
  useRefiner: false,
  useFp32: false,
  useLcmLora: false,
  sampler: '',
  setSeed: false,
});

const emit = defineEmits<{
  (e: 'onChoosePreview', data: any): void;
  (e: 'onApplySeed', data: any): void;
}>();

// const loadingInstance = ElLoading.service();
const state = reactive({
  formData: {
    positivePrompt: '',
    negativePrompt: '',
    numInferenceSteps: 3,
    width: 256,
    height: 256,
  },
  presetSize: {},
  imageData: {},
  imageSrc: '',
  imageInfo: {},
  loading: false,
  progress: '',
  promptList: [] as any,
  positivePromptList: [] as any,
  negativePromptList: [] as any,
  promptCategoryList: [] as any,
  promptIndexData: [] as any,
  loadingFlag: false,
  previewVisible: false,
  positivePromptString: '',
  negativePromptString: '',
  modelInfo: [],
  beginToGenerateFlag: false,
  cancelButtonFlag: false,
  progressInfo: {
    generatingIndexBase: undefined,
    currentTimestepBase: undefined,
    generatingIndexRefiner: undefined,
    currentTimestepRefiner: undefined,
    isSameUser: false,
    temporyLatentImage: '' as string | undefined,
  } as any,
  onProgress: false,
  onCancelling: false,
  onCoolingDown: false,
  preparingFlag: false,
  justRefreshedFlag: true,
  getLastImageFlag: false,
  generatingDisable: true,

  isLooping: false,

  previewImageVisible: false,
  previewPromptVisible: false,
  applyThisSeedFlag: false,
});

const previewStyle = computed(() => {
  return global.$store.state.app.currentWritingFlag;
}) as any;

const currentModel = computed(() => {
  return global.$store.state.app.currentModel;
}) as any;

const currentWritingFlag = computed(() => {
  return global.$store.state.app.currentWritingFlag;
}) as any;

const currentPreviewList = computed(() => global.$store.state.app.currentPreviewList) as any;

const lastPreviewData = computed(() => {
  const length = currentPreviewList.value.length;
  return currentPreviewList.value[length - 1];
}) as any;

const progressPercentageBase = computed(() => {
  return (1000 - state.progressInfo.currentTimestepBase) / 10;
});

const progressPercentageRefiner = computed(() => {
  return (1000 - state.progressInfo.currentTimestepRefiner) / 10;
});

const systemSettings = computed(() => global.$store.state.app.systemSettings);

// const progressPercentageBase = computed(() => {
//   return (
//     (state.progressInfo.generatingIndexBase / state.progressInfo.generatingStepsBase) *
//     100
//   ).toFixed(2);
// });

// const progressPercentageRefiner = computed(() => {
//   return (
//     (state.progressInfo.generatingIndexRefiner /
//       state.progressInfo.generatingStepsRefiner) *
//     100
//   ).toFixed(2);
// });

const previewDialogData = computed(() => {
  const result = currentPreviewList.value.find((item: any) => item.active);
  return result ? result.base64Data : '';
});

const justRefreshedFlag = computed(() => global.$store.state.app.justRefreshedFlag) as any;

const previewingImage = computed(() => {
  return state.onProgress ? state.progressInfo.temporyLatentImage : state.imageSrc;
});

const userInfo = computed(() => {
  return global.$store.state.user.userInfo;
});

watch(
  () => currentPreviewList.value,
  (newValue: any, oldValue: any) => {
    console.log('watch currentPreviewList.value++++', newValue);
    if (newValue.length === 0) {
      state.imageSrc = '';
    }
  },
  {
    deep: true,
  }
);

const handleSaveImage = () => {
  saveImagePromise()
    .then(() => {
      const tempData = currentPreviewList.value;
      tempData.forEach((item: any) => {
        item.saved = item.active || item.saved;
      });
      global.$store.commit('app/updateCurrentPreviewList', tempData);
      global.$store.commit('app/cleanGallaryListCacheData');
      global.$message.success('保存成功');
    })
    .catch((error: any) => {
      console.log(error);
      global.$message.error('保存失败');
    });
};

const saveImagePromise = () => {
  state.formData.positivePrompt = mergePromptWords('positive');
  state.formData.negativePrompt = mergePromptWords('negative');
  console.log('currentPreviewList+++++++');
  console.log(currentPreviewList.value);
  const chosenPreviewData: any = currentPreviewList.value.find((item: any) => item.active);

  return new Promise((resolve, reject) => {
    console.log('userInfo.value');
    console.log(userInfo.value);
    const welinkUserId = userInfo.value.welinkUserId;
    const guestUserId = userInfo.value.guestUserId;
    const userId = userInfo.value.id;
    const userComesFrom = !!welinkUserId ? 'welink' : 'guest';
    saveImageToAlbumRequest({
      base64Data: state.imageSrc,
      customPositivePrompt: chosenPreviewData.customPositivePrompt,
      positivePrompt: chosenPreviewData.positivePrompt,
      customNegativePrompt: chosenPreviewData.customNegativePrompt,
      negativePrompt: chosenPreviewData.negativePrompt,
      otherSettings: {
        numInferenceSteps: Number(props.settings.numInferenceSteps),
        numInferenceStepsRefiner: props.useRefiner
          ? Number(props.settings.numInferenceStepsRefiner)
          : undefined,
      },
      seed: chosenPreviewData.seed,
      width: Number(chosenPreviewData.width),
      height: Number(chosenPreviewData.height),
      welinkUserId,
      guestUserId,
      userId,
      userComesFrom,
    })
      .then((response: any) => {
        console.log('saveImageToAlbumRequest+++++', response);
        resolve(response);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

const mergePromptWords = (type: string) => {
  let result = '';
  if (type === 'positive') {
    state.positivePromptList.forEach((item: any) => {
      result += getActiveTag(item.content).map((item2: any) => item2.value);
    });
  }
  if (type === 'negative') {
    state.negativePromptList.forEach((item: any) => {
      result += getActiveTag(item.content).map((item2: any) => item2.value);
    });
  }

  return result;
};

const handleChoosePreview = (index: number) => {
  const result = currentPreviewList.value.map((item2: any, index2: number) =>
    Object.assign(item2, {
      active: index === index2,
    })
  );

  if (result.length > 0) {
    state.imageSrc = result[index].base64Data;
    global.$store.commit('app/updateCurrentPreviewList', result);
  } else {
    state.imageSrc = '';
  }
  emit('onChoosePreview', index);
};

const handleDeletePreview = async (index: number) => {
  global.$confirm('确认删除？', '提示', {}).then(() => {
    confirmDeletePreview(index);
  });
};

const confirmDeletePreview = async (index: number) => {
  global.$store.commit('app/removePreviewByIndex', index);
  await nextTick();
  const activeIndex =
    index === currentPreviewList.value.length ? currentPreviewList.value.length - 1 : index;
  removeSessionCacheItemByIndex(index);
  handleChoosePreview(activeIndex);
};

const removeSessionCacheItemByIndex = (index: number) => {
  const txt2ImgSessionData: object[] = global.$getTxt2ImgSessionData();
  txt2ImgSessionData.splice(index, 1);
  console.log('removeSessionCacheItemByIndex+++++');
  console.log(removeSessionCacheItemByIndex);
  updatePeviewListData(txt2ImgSessionData);
};

const updatePeviewListData = (data: any[]) => {
  let currentPreviewListData: any[] = currentPreviewList.value;
  currentPreviewListData = data;
  global.$store.commit('app/updateCurrentPreviewList', currentPreviewListData);
  sessionStorage.setItem('txt2ImgSessionData', JSON.stringify(currentPreviewList.value));
};

const getActiveTag = (promptList: any) => {
  if (!promptList) return [];
  return promptList.filter((item: any) => item.active);
};

const handleOpenImagePreviewDialog = () => {
  // state.previewImageVisible = true;
};

const handleClosePreviewImageDialog = () => {
  state.previewImageVisible = false;
};

const handleToggleApplySeed = async (data: boolean) => {
  global.$message.success('已采用此种子');
  let currentSeed: number | null = null;
  if (data) {
    const currentPreviewListData: any[] = currentPreviewList.value;
    currentSeed = currentPreviewListData.find((item: any) => item.active).seed;
  }

  emit('onApplySeed', 0);
  await nextTick();
  emit('onApplySeed', currentSeed);
};

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '50px',
  },
  spin: true,
});

onMounted(async () => {
  // handleChooseLastPreview();
});

onBeforeUnmount(() => {
  state.onProgress = false;
});
</script>

<style lang="scss" scoped>
.preview_container {
  display: flex;
  width: 40%;
  height: 100%;

  .preview_wrapper {
    display: inline-block;
    flex: 1;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;

    .button_item {
      text-align: center;

      .ant-btn-group,
      .ant-btn-group {
        display: flex;
        border-radius: 5px;
      }

      .ant-btn-group {
        // border: 1px solid rgba(64, 158, 255);
      }

      button {
        width: 100%;
        height: 2rem;
        overflow: hidden;
      }

      .cancelbutton {
        display: inline-block;
        width: 2rem;
        z-index: 333;
        position: relative;
        border: 0;

        span {
          display: inline-block;
          width: 100%;
          height: 100%;
          line-height: 1.7rem;
          position: relative;
        }
      }

      .processingbutton {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        padding: 0;

        span {
          display: flex;
          width: 100%;
          height: 100%;
          font-size: 0;

          .text {
            display: inline-block;
            position: relative;
            font-size: 0.5rem;
            width: 100%;
            height: 0.5rem;
            line-height: 0.5rem;
            padding: 0.2rem 0;
            z-index: 1;
            color: #fff;
            background-color: #000;
          }

          .background {
            display: inline-block;
            width: 100%;
            height: 100%;
            position: absolute;
            animation: animate 8s linear infinite;
            background-image: repeating-linear-gradient(
              110deg,
              #000 0%,
              #000 4%,
              red 4.1%,
              red 8.6%
            );
            top: 0;
            left: 0;
            transition: all 0.3s;
          }
        }

        &.refiner {
          .background {
            background-image: repeating-linear-gradient(
              110deg,
              #000 0%,
              #000 4%,
              yellow 4.1%,
              yellow 8.6%
            );
          }
        }
      }

      .progressbutton {
        display: inline-block;
        width: 100%;
        padding: 0;
        border: 0;

        span {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          justify-content: center;

          .text {
            display: inline-block;
            width: 100%;
            padding: 0.3rem;
            z-index: 1;
            position: relative;
            font-size: 0.4rem;
            letter-spacing: 0.1rem;
            color: #fff;
            background-color: rgba($color: #000000, $alpha: 1);
          }

          .background {
            display: inline-block;
            width: 100%;
            height: 100%;
            animation: animate 8s linear infinite;
            background-image: repeating-linear-gradient(
              110deg,
              #000 0%,
              #000 4%,
              rgb(64, 158, 255) 4.1%,
              rgb(64, 158, 255) 8.6%
            );
            position: absolute;
            top: 0;
            left: 0;
          }

          .preparingbutton {
            display: inline-block;
            vertical-align: middle;
            position: relative;
          }
        }
      }

      .cancelingbutton {
        display: inline-block;
        width: 100%;
        padding: 0;

        span {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          justify-content: center;

          .text {
            display: inline-block;
            width: 100%;
            padding: 0.3rem;
            z-index: 1;
            position: relative;
            font-size: 0.4rem;
            letter-spacing: 0.1rem;
            color: #fff;
            background-color: rgba(42, 89, 138);
          }

          .background {
            display: inline-block;
            width: 100%;
            height: 100%;
            background-image: repeating-linear-gradient(
              110deg,
              #ff6a00 0%,
              #ff6a00 4%,
              rgb(0, 102, 255) 4.1%,
              rgb(0, 102, 255) 8.6%
            );
            animation: animate 8s linear infinite;

            position: absolute;
            top: 0;
            left: 0;
          }

          .preparingbutton {
            display: inline-block;
            vertical-align: middle;
            position: relative;
          }
        }
      }

      .coolingdownbutton {
        display: inline-block;
        width: 100%;
        padding: 0;

        span {
          display: flex;
          width: 100%;
          height: 100%;
          position: relative;
          justify-content: center;

          .text {
            display: inline-block;
            width: 100%;
            padding: 0.3rem;
            z-index: 1;
            position: relative;
            font-size: 0.4rem;
            letter-spacing: 0.1rem;
            color: #fff;
            background-color: rgba(42, 89, 138);
          }

          .background {
            display: inline-block;
            width: 100%;
            height: 100%;
            background-image: repeating-linear-gradient(
              110deg,
              #00ff2f 0%,
              #00ff2f 4%,
              #000 4.1%,
              #000 8.6%
            );
            animation: animate 8s linear infinite;

            position: absolute;
            top: 0;
            left: 0;
          }

          .preparingbutton {
            display: inline-block;
            vertical-align: middle;
            position: relative;
          }
        }
      }
    }

    .preview {
      flex: 1;
      margin: 0.5rem 0.6rem 0 0.5rem;
      padding: 0.4rem;
      width: calc(100% - 1rem);
      height: 15rem;
      min-height: 10rem;
      overflow: hidden;
      box-sizing: border-box;
      border: 1px solid #333;
      position: relative;
      text-align: center;

      &:before {
        content: '';
        display: inline-block;
        width: 0;
        height: 100%;
        vertical-align: middle;
      }

      &:hover {
        .applythisseed {
          opacity: 1;
        }
      }

      .ant-image {
        width: 100%;

        .ant-image-img {
          width: 100%;
          height: 100%;
        }
      }

      .applythisseed {
        position: absolute;
        top: 1rem;
        right: 0.5rem;
        opacity: 0;
      }

      .common_progress_item {
        display: inline-block;
        vertical-align: middle;
      }
    }

    .operation {
      margin: 0.5rem;
      height: 3rem;
    }
  }

  .previewlist_wrapper {
    display: flex;
    flex-direction: column;
    // margin: 0 0 0 0.3rem;
    width: 3.7rem;
    height: 100%;
    // height: 600px;

    border-left: 1px solid #333;

    // border-right: 1px solid #333;
    h1 {
      font-size: 0.4rem;
      margin: 0;
      padding: 0.2rem 0;
      font-weight: normal;
      text-align: center;
      color: #000;
    }

    .el-scrollbar {
      flex: 1;

      ul {
        width: 100%;
        height: 100%;

        li {
          // margin: 0.3rem 0 0 0;
          margin: 0;
          margin: 0 0.3rem 0.3rem 0.3rem;
          width: 3rem;
          height: 3rem;
          border-style: solid;
          border-width: 2px;
          border-color: transparent;
          transition: all 0.3s;
          position: relative;

          .savedicon {
            display: inline-block;
            position: absolute;
            left: 0;
            top: 0;
            font-size: 0.8rem;
          }

          .el-image {
            width: 100%;
            height: 100%;
          }

          .generating {
            display: flex;
            width: 100%;
            height: 100%;
            text-align: center;
            align-items: center;

            > div {
              width: 100%;
            }
          }

          .operation {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: all 0.3s;
            text-align: right;

            a {
              display: inline-block;

              .el-icon {
                margin: 0.1rem;
                font-size: 0.5rem;
              }
            }
          }

          &:hover {
            .operation {
              opacity: 1;
            }
          }

          &.active {
            border-color: #ccc;
          }
        }
      }
    }
  }
}
</style>
