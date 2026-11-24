<template>
  <div class="prompt_container">
    <CommonPromptSelector @onChange="handleChangePromptSelector" />

    <InpaintSettings
      :promptList="state.promptList"
      :appliedSeed="props.appliedSeed"
      @onPositivePromptChanged="handlePositivePromptChanged"
      @onNegativePromptChanged="handleNegativePromptChanged"
      @onSettingChanged="handleSettingChanged"
      @onChangeUseNegativePrompt="handleIsUsingNegativeChanged"
    />
    <Preview
      :image="state.settings.imageSrc"
      :mask="state.settings.maskBase64Data"
      :positivePrompt="state.settings.positivePrompt"
      :customPositivePrompt="state.settings.customPositivePrompt"
      :negativePrompt="state.settings.negativePrompt"
      :customNegativePrompt="state.settings.customNegativePrompt"
      :width="state.settings.width"
      :height="state.settings.height"
      :settings="state.settings"
      :useNegativePrompt="state.useNegativePrompt"
      :setSeed="state.setSeed"
      :useRefiner="state.useRefiner"
      :useFp32="state.useFp32"
      :useLcmLora="state.useLcmLora"
      :sampler="state.sampler"
      @onChoosePreview="handleChoosePreview"
      @onApplySeed="handleApplySeed"
    />
  </div>
</template>

<script lang="tsx" setup>
import {
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  ComponentInternalInstance,
} from 'vue';

import type { SelectProps, UploadFile } from 'ant-design-vue';
import Preview from './Preview.vue';
import InpaintSettings from './InpaintSettings.vue';

import {
  promptManagementGetRequest,
  promptCategoryManagementGetRequest,
  modelManagemenGetRequest,
} from '@/api/sdxl';

import { dictionaryManagementGetRequest } from '@/api/dictionary';
// SelectValue
// DefaultOptionType
const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;
const {
  proxy: { $forceUpdate },
}: any = getCurrentInstance();

interface Props {
  currentPreviewIndex?: number | null;
  appliedSeed?: number | null;
  useNegativePrompt?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  currentPreviewIndex: null,
  appliedSeed: null,
  useNegativePrompt: '',
});

const emit = defineEmits<{
  (e: 'onMaskChanged', data: any): void;
  (e: 'onPositivePromptChanged', data: any): void;
  (e: 'onCustomPositivePromptChanged', data: any): void;
  (e: 'onNegativePromptChanged', data: any): void;
  (e: 'onCustomNegativePromptChanged', data: any): void;
  (e: 'onSettingChanged', data: any): void;
  (e: 'onChangeUseNegativePrompt', data: any): void;
}>();

// currentPreviewIndex

// const loadingInstance = ElLoading.service();
const state = reactive({
  formData: {},
  promptTabActive: 'positive',
  positivePromptContentTabActive: 'option',
  negativePromptContentTabActive: 'option',
  promptList: [] as any,
  imageData: {},
  imageSrc: '',
  imageInfo: {},
  loading: false,
  progress: '',
  positivePromptList: [] as any,
  negativePromptList: [] as any,

  promptCategoryList: [] as any,
  promptIndexData: [] as any,
  loadingFlag: false,
  previewPromptVisible: false,
  positivePromptString: '',
  negativePromptString: '',
  modelInfo: [] as any,
  beginToGenerateFlag: false,
  onProgress: false,
  cancelButtonFlag: false,
  progressbarFlag: false,
  progressInfo: {
    generatingIndex: undefined,
    generatingSteps: undefined,
  },
  hoverProgressbarFlag: false,
  cancellingFlag: false,
  preparingFlag: false,
  getLastImageFlag: false,
  generatingDisable: true,
  generationStatus: {
    onCancelling: false,
    onProgress: false,
    generatingIndex: null,
    generatingSteps: null,
  },

  ratioSettingsDictionary: [
    {
      name: 'onetoone',
      active: true,
      sizeList: ['512:512', '960:960', '1024:1024', '1280:1280', '2560:2560', '4096:4096'],
    },
    {
      name: 'tentofifteen',
      active: false,
      sizeList: ['512:768', '768:1152', '1024:1536', '2048:3072', '4096:6144'],
    },
    {
      name: 'fifteentoten',
      active: false,
      sizeList: ['768:512', '1152:768', '1536:1024', '3072:2048', '6144:4096'],
    },
  ],
  collapseIndex: [
    {
      name: 'useNegativePrompt',
      value: '0',
    },
    {
      name: 'setSeed',
      value: '1',
    },
    {
      name: 'useRefiner',
      value: '2',
    },
  ],
  previewPositivePromptsTabsActive: false,
  chosenPreviewIndex: 0,

  sizePresetListTop: [] as any,
  sizePresetListBottom: [] as any,
  collapsedSettings1: [],
  collapsedSettings2: [],
  useNegativePrompt: false,
  useRefiner: false,
  useFp32: false,
  useLcmLora: false,
  sampler: 'DPM++ 2M Karras',
  setSeed: true,
  imageContentCategoryList: [] as any,

  settings: {
    maskBase64Data: '',
    imageSrc: '',
    fileList: [],

    settings: {} as any,
    appliedSeed: false,

    positivePrompt: '',
    negativePrompt: '',
    customPositivePrompt: '',
    customNegativePrompt: '',
    positivePromptListWithCategory: [] as any,
    negativePromptListWithCategory: [] as any,
    strength: 0,
    guidanceScale: 0,
    denoisingEnd: undefined,
    denoisingStart: undefined,
    numInferenceSteps: 0,
    numInferenceStepsRefiner: 0,
    width: 0,
    height: 0,
    // seed: null as number | null,
    seed: null as number | null,
  },

  readyFlag: false,
});

const currentPreviewList = computed(() => global.$store.state.app.currentPreviewList) as any;

const handlePositivePromptChanged = (data: any) => {
  state.positivePrompt = data.options;
  state.customPositivePrompt = data.custom;
};

const handleNegativePromptChanged = (data: any) => {
  state.negativePrompt = data.options;
  state.customNegativePrompt = data.custom;
};

const handleIsUsingNegativeChanged = (value: boolean) => {
  state.useNegativePrompt = value;
};

const handleSettingChanged = (data: any) => {
  state.settings = data;
  state.useNegativePrompt = data.useNegativePrompt;
  state.setSeed = data.setSeed;
  state.useRefiner = data.useRefiner;
  state.useFp32 = data.useFp32;
  state.useLcmLora = data.useLcmLora;
  state.sampler = data.sampler;
};

watch(
  () => state.settings.width,
  (newValue: any) => {
    console.log('waatch state.settings.width++++', newValue);
  }
);

watch(
  () => state.useNegativePrompt,
  (newValue: any) => {
    const collapseValue = state.collapseIndex.find(
      (item) => item.name === 'useNegativePrompt'
    )?.value;
    const checkExist = state.collapsedSettings1.some((item) => item === collapseValue);
    if (newValue && !checkExist) {
      state.collapsedSettings1.push(collapseValue);
    }
  }
);

watch(
  () => state.useRefiner,
  (newValue: any) => {
    const collapseValue = state.collapseIndex.find((item) => item.name === 'useRefiner').value;
    const checkExist = state.collapsedSettings2.some((item) => item === collapseValue);
    if (newValue && !checkExist) {
      state.collapsedSettings2.push(collapseValue);
    }
  }
);

watch(
  () => state.setSeed,
  (newValue: any) => {
    const collapseValue = state.collapseIndex.find((item) => item.name === 'setSeed').value;
    const checkExist = state.collapsedSettings2.some((item) => item === collapseValue);
    if (newValue && !checkExist) {
      state.collapsedSettings2.push(collapseValue);
    }
  }
);

watch(
  () => currentPreviewList.value,
  (newValue: any) => {
    newValue.forEach((item: any, index: number) => {
      if (item.active) {
        state.chosenPreviewIndex = index;
        initCachedSettingData(index);
        emitPositivePromptString();
        emitNegativePromptString();
        emitOnSettingChanged();
      }
    });
  }
);

watch(
  () => props.appliedSeed,
  (newValue: any) => {
    console.log('props.appliedSeed+++++', newValue);
    if (newValue == null) return;
    state.setSeed = true;
    state.settings.seed = newValue;
  }
);

const getPresetSizeTop = () => {
  let activeItem: any = state.ratioSettingsDictionary.find((item: any) => item.active);
  activeItem = !!activeItem ? activeItem : { sizeList: [] };
  return activeItem.sizeList.filter((item: any, index: number) => index < 3);
};

const getPresetSizeBottom = () => {
  let activeItem: any = state.ratioSettingsDictionary.find((item: any) => item.active);
  activeItem = !!activeItem ? activeItem : { sizeList: [] };
  return activeItem.sizeList.filter((item: any, index: number) => index > 2);
};

const initData = async () => {
  state.sizePresetListTop = getPresetSizeTop();
  state.sizePresetListBottom = getPresetSizeBottom();

  if (!global.$store.state.app.applySettingsUsed) {
    applySettings();
  } else {
    initCachedSettingData(currentPreviewList.value.length - 1);
  }

  emitPositivePromptString();
  emitNegativePromptString();
  emitOnSettingChanged();
};

const emitOnSettingChanged = () => {
  console.log(state.settings);
  state.settings = {
    useNegativePrompt: state.useNegativePrompt,
    numInferenceSteps: state.settings.numInferenceSteps,
    strength: state.settings.strength,
    guidanceScale: state.settings.guidanceScale,
    denoisingEnd: state.settings.denoisingEnd,
    numInferenceStepsRefiner: state.settings.numInferenceStepsRefiner,
    denoisingStart: state.settings.denoisingStart,
    useRefiner: state.useRefiner,
    useFp32: state.useFp32,
    useLcmLora: state.useLcmLora,
    sampler: state.sampler,
    setSeed: state.setSeed,
    seed: state.settings.seed,
  };
  emit('onSettingChanged', Object.assign(state.settings, state.settings));
};

const checkIfCheckAll = (promptType: string, category: string) => {
  let result: string | boolean = false;
  let promptListByCategoryData = [] as any;
  if (promptType === 'positive') {
    promptListByCategoryData = state.settings.positivePromptListWithCategory.find(
      (item: any) => item.value === category
    );
  }

  if (promptType === 'negative') {
    promptListByCategoryData = state.settings.negativePromptListWithCategory.find(
      (item: any) => item.value === category
    );
  }

  if (!promptListByCategoryData) return false;

  const promptListByCategory = promptListByCategoryData.content;
  const activePromptList = promptListByCategory.filter((item: any) => item.active);

  if (activePromptList.length > 0 && activePromptList.length < promptListByCategory.length) {
    result = 'intermediate';
  } else {
    result = !(activePromptList.length === 0);
  }

  return result;
};
const getActiveTag = (promptList: any) => {
  if (!promptList) return [];
  return promptList.filter((item: any) => item.active);
};

const transformPromptOptionsToString = () => {
  let positivePromptString = '';
  let negativePromptString = '';

  state.settings.positivePromptListWithCategory.forEach((item: any) => {
    const activeList = getActiveTag(item.content);
    positivePromptString += activeList.map((item2: any) => item2.value.trim());
    if (activeList.length > 0) positivePromptString += ',';
  });
  state.settings.negativePromptListWithCategory.forEach((item: any) => {
    const activeList = getActiveTag(item.content);
    negativePromptString += activeList.map((item2: any) => item2.value.trim());
    if (activeList.length > 0) negativePromptString += ',';
  });
  state.settings.positivePromptString = positivePromptString;
  state.settings.negativePromptString = negativePromptString;
};

const getModelInfoPromise = () => {
  return new Promise((resolve, reject) => {
    modelManagemenGetRequest()
      .then((response: any) => {
        state.modelInfo = response.data;
        resolve(response);
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
};

const parseDefaultSettings = () => {
  const defaultSettingsString = state.modelInfo[0].defaultSettings;
  let defaultSettingsObject = {} as any;
  try {
    defaultSettingsObject = JSON.parse(defaultSettingsString);

    if (defaultSettingsObject.useRefiner) {
      state.useRefiner = defaultSettingsObject.useRefiner;
    }

    Object.keys(defaultSettingsObject).forEach((item: string) => {
      state.settings[item] = defaultSettingsObject[item];
    });
  } catch (error) {
    return;
  }
};

const emitPositivePromptString = () => {
  transformPromptOptionsToString();
  emit('onPositivePromptChanged', {
    options: state.settings.positivePromptString,
    custom: state.settings.customPositivePrompt,
  });
};

const emitNegativePromptString = () => {
  transformPromptOptionsToString();
  emit('onNegativePromptChanged', {
    options: state.settings.negativePromptString,
    custom: state.settings.customNegativePrompt,
  });
};

const handleChooseRatio = (index: number) => {
  state.ratioSettingsDictionary.forEach((item: any, index2: number) => {
    item.active = index === index2;
  });
  state.sizePresetListTop = getPresetSizeTop();
  state.sizePresetListBottom = getPresetSizeBottom();
  emitOnSettingChanged();
};

const initCachedSettingData = (index: number) => {
  if (currentPreviewList.value.length === 0) return;
  const chosenPreviewData = currentPreviewList.value[index];
  console.log('=====chosenPreviewData=====');
  console.log(chosenPreviewData);
  const chosenPositivePreviewDataString = chosenPreviewData.positivePrompt;
  const chosenNegativePreviewDataString = chosenPreviewData.negativePrompt;
  const chosenPositivePromptData = chosenPositivePreviewDataString
    ? chosenPositivePreviewDataString.split(',')
    : [];
  const chosenNegativePromptData = chosenNegativePreviewDataString
    ? chosenNegativePreviewDataString.split(',')
    : [];

  state.settings.positivePromptListWithCategory.forEach((item: any, index1: number) => {
    item.content.forEach((item2: any, index2: number) => {
      state.settings.positivePromptListWithCategory[index1].content[index2].active =
        !!chosenPositivePromptData.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('positive', item.value);
  });
  state.settings.negativePromptListWithCategory.forEach((item: any, index1: number) => {
    item.content.forEach((item2: any, index2: number) => {
      state.settings.negativePromptListWithCategory[index1].content[index2].active =
        !!chosenNegativePromptData.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('negative', item.value);
  });

  state.settings.positivePromptString = chosenPositivePreviewDataString;
  state.settings.negativePromptString = chosenNegativePreviewDataString;

  console.log(chosenPreviewData);

  state.settings.customNegativePrompt = chosenPreviewData.customNegativePrompt;
  state.settings.customPositivePrompt = chosenPreviewData.customPositivePrompt;

  state.setSeed = global.$isNotEmpty(chosenPreviewData.seed);
  state.settings.seed = chosenPreviewData.seed;
  state.settings.width = chosenPreviewData.width;
  state.settings.height = chosenPreviewData.height;

  state.useNegativePrompt =
    global.$isNotEmpty(chosenPreviewData.customNegativePrompt) ||
    global.$isNotEmpty(chosenNegativePreviewDataString);

  state.settings.numInferenceSteps = chosenPreviewData.numInferenceSteps;
  state.settings.numInferenceStepsRefiner = chosenPreviewData.numInferenceStepsRefiner;

  state.useRefiner = chosenPreviewData.useRefiner;
  state.useFp32 = chosenPreviewData.useFp32;
  state.useLcmLora = chosenPreviewData.useLcmLora;
};

const applySettings = async () => {
  const applySettingsData = global.$store.state.app.applySettingsData;
  if (!applySettingsData) return;
  const positivePromptList = applySettingsData.positivePrompt.split(',');
  const negativePromptList = applySettingsData.negativePrompt.split(',');
  console.log('=====applySettingsUsed=====');
  console.log(positivePromptList);
  console.log(state.settings.positivePromptListWithCategory);

  state.settings.positivePromptListWithCategory.forEach(async (item: any) => {
    item.content.forEach((item2: any) => {
      item2.active = !!positivePromptList.find((item3: any) => item3 === item2.value);
    });

    item.checkAll = checkIfCheckAll('positive', item.value);
  });
  console.log('positivePromptListWithCategory');
  console.log(state.settings.positivePromptListWithCategory);
  state.settings.negativePromptListWithCategory.forEach((item: any) => {
    item.content.forEach((item2: any) => {
      item2.active = !!negativePromptList.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('negative', item.value);
  });

  state.settings.customPositivePrompt = applySettingsData.customPositivePrompt;
  state.settings.customNegativePrompt = applySettingsData.customNegativePrompt;

  if (
    global.$isNotEmpty(applySettingsData.customNegativePrompt) ||
    global.$isNotEmpty(applySettingsData.negativePrompt)
  ) {
    state.useNegativePrompt = true;
  }

  if (global.$isNotEmpty(applySettingsData.numInferenceStepsRefiner)) {
    state.useRefiner = true;
  }

  if (global.$isNotEmpty(applySettingsData.seed)) {
    state.setSeed = true;
  }

  console.log('applySettingsData+++++');
  console.log(applySettingsData);
  state.settings.width = applySettingsData.width;
  state.settings.height = applySettingsData.height;
  state.settings.numInferenceSteps = applySettingsData.numInferenceSteps;
  state.settings.numInferenceStepsRefiner = applySettingsData.numInferenceStepsRefiner || 0;
  state.settings.seed = applySettingsData.seed ? Number(applySettingsData.seed) : null;

  matchRatioSetting(applySettingsData);

  emitPositivePromptString();
  emitNegativePromptString();
  emitOnSettingChanged();
  setTimeout(() => {
    global.$store.commit('app/updateApplySettingsUsed', true);
  }, 2000);

  emit(
    'onSettingChanged',
    Object.assign(state.settings, {
      useNegativePrompt: state.useNegativePrompt,
    })
  );
};

const matchRatioSetting = async (settingData: any) => {
  console.log('matchRatioSetting');
  console.log(state.ratioSettingsDictionary);
  console.log(settingData.width);
  console.log(settingData.height);

  state.ratioSettingsDictionary.forEach((item: any, index: number) => {
    item.sizeList.forEach((item2: any) => {
      const width: number = item2.split(':')[0];
      const height: number = item2.split(':')[1];
      if (settingData.width === Number(width) && settingData.height === Number(height)) {
        handleChooseRatio(index);
      }
    });
  });
};

const handleChoosePreview = (index: number) => {
  state.chosenPreviewIndex = index;
};

const handleApplySeed = (seed: number | null) => {
  state.appliedSeed = seed;
};

const handleChangePromptSelector = (allPrompt) => {
  console.log(allPrompt);
};

onMounted(async () => {
  await getModelInfoPromise();
  parseDefaultSettings();
  initData();
  global.$NProgress.done();
});

onBeforeUnmount(() => {
  state.onProgress = false;
});
</script>

<style lang="scss" scoped>
.prompt_container {
  display: flex;
  // margin: 1.5rem 0 0 0;
  width: 100%;
  box-sizing: border-box;
  border-right: 1px solid #333;
  text-align: left;
  position: relative;
  font-size: 0;
  overflow: visible;

  .inpaintsettings_wrapper {
    margin: 0.8rem 0 0 0;
    width: 30%;
    height: 100%;
    .common_upload_item {
      width: 3rem;
    }
    .size_item {
      width: 100%;
    }

    .ant-collapse-item {
      padding: 0 0 0.2rem 0;
    }

    .settingitem {
      width: 100%;
      align-items: center;
      border-top: 1px solid #444;

      .ant-form-item {
        margin-bottom: 0;
      }

      .settingitemcontent {
        display: flex;
        margin: 0.3rem 0;
        width: 100%;

        .switchertitle {
          display: inline-block;
          margin: 0 0.2rem 0 0;
          flex: 1;
          text-align: left;
          font-weight: bold;
        }

        .switcher {
          display: inline-block;

          width: 1.5rem;
          vertical-align: middle;
          text-align: right;
        }

        .select {
          display: inline-block;
          padding: 0 0.5rem 0 0;
          width: 5rem;

          .ant-select {
            width: 100% !important;
          }
        }
      }
    }

    .input_container {
      display: inline-block;
      padding: 0.3rem 0.6rem 0 0.6rem;
      flex: 1;
      width: 100%;
      box-sizing: border-box;

      > .content {
        position: relative;
        margin: 0 0 0.5rem 0;
        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          position: absolute;
          .common_upload_item {
            position: relative;
            padding: 0 0 0 0.2rem;
            z-index: 2;
            .deletebutton {
              z-index: 2;
            }
          }
          .previewprompt {
            margin: 0.2rem;
            z-index: 2;
          }
        }
        .maskviewer {
          position: absolute;
          transform: scale(10%);
          transform-origin: top right;
          right: 0;
          top: 1.5rem;
          z-index: 1;
          opacity: 0.5;
        }
        // height: 5rem;
        .header {
          width: 50%;
          position: absolute;
          top: 0.1rem;
          right: 0.1rem;

          text-align: right;
          border: 0;
          z-index: 1;

          > span {
            display: inline-block;
            font-size: 0.4rem;
            margin: 0 0.5rem 0 0;
          }

          .previewprompt {
            right: 0;
          }
        }

        .ant-tabs {
          .tablist {
            .ant-tabs-nav-wrap {
              .ant-tabs-nav-list {
                .positiveprompttablabel {
                  .checkbox {
                    margin: 0 0.1rem 0 0;
                    position: relative;
                    top: 0.05rem;
                  }
                }
              }
            }
          }
        }

        .el-textarea {
          background-color: #000;

          .el-textarea__inner {
            box-sizing: border-box;
          }
        }

        .promptarea {
          border: 1px solid #ccc;
          width: 100%;
          min-height: 4rem;
          transition: all 0.3s;
          text-align: left;
          background-color: #fff;
          box-sizing: border-box;

          &:hover {
            border: 1px solid #999;
          }

          ul {
            li {
              display: inline-block;
              margin: 0.1rem;
            }
          }
        }

        :deep(.ant-collapse) {
          background-color: red;
          > .ant-collapse-item {
            .ant-collapse-header {
              width: 100%;
              align-items: center;
              .ant-collapse-header-text {
                display: inline-block;

                width: 50%;
              }
              .ant-collapse-extra {
                display: inline-block;
                width: 50%;
              }
              .ant-form-item {
                width: 100%;

                .ant-form-item-control {
                  width: 100% !important;
                }
              }
            }
          }
        }

        .userefuner {
          .ant-collapse-item {
            padding: 0 0 0.5rem 0;
          }
        }
      }

      .el-textarea {
        font-size: 0.5rem;

        :deep(.el-textarea__inner) {
          // padding: 0.2rem 0.4rem;
        }
      }

      .ratiosettings {
        display: flex;
        width: 100%;
        justify-content: space-around;

        li {
          display: flex;
          width: 2rem;
          height: 2rem;
          text-align: center;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            .outer {
              border: 1px solid #000;
            }
          }

          &.active {
            &:hover {
              .outer {
                border: 1px solid #409eff;
              }
            }

            .outer {
              border: 1px solid #409eff;

              .inner {
                span {
                  &.lefttop {
                    border-color: #409eff transparent transparent #409eff;
                  }

                  &.righttop {
                    border-color: #409eff #409eff transparent transparent;
                  }

                  &.rightbottom {
                    border-color: transparent #409eff #409eff transparent;
                  }

                  &.leftbottom {
                    border-color: transparent transparent #409eff #409eff;
                  }
                }
              }
            }
          }

          .outer {
            display: inline-block;
            padding: 0.1rem;
            border: 1px solid #999;
            transition: all 0.3s;

            .inner {
              display: inline-block;
              width: 100%;
              height: 100%;
              position: relative;

              span {
                display: inline-block;
                width: 10%;
                height: 10%;
                border-style: solid;
                border-width: 1px;
                position: absolute;

                &.lefttop {
                  left: 0;
                  top: 0;
                  border-color: #999 transparent transparent #999;
                }

                &.righttop {
                  right: 0;
                  top: 0;
                  border-color: #999 #999 transparent transparent;
                }

                &.rightbottom {
                  right: 0;
                  bottom: 0;
                  border-color: transparent #999 #999 transparent;
                }

                &.leftbottom {
                  left: 0;
                  bottom: 0;
                  border-color: transparent transparent #999 #999;
                }
              }
            }
          }

          &.onetoone {
            .outer {
              width: 1rem;
              height: 1rem;
            }
          }

          &.tentofifteen {
            .outer {
              width: 0.67rem;
              height: 1rem;
            }
          }

          &.fifteentoten {
            .outer {
              width: 1rem;
              height: 0.67rem;
            }
          }
        }
      }

      .steps {
        margin: 0 0 0.5rem 0;
      }

      .imageratio {
        width: 100%;
        text-align: center;

        ul {
          display: flex;
          width: 100%;
          margin: 0 0 0.2rem 0;
          justify-content: space-between;

          li {
            display: inline-block;

            .a-button {
              width: 3.1rem;
            }
          }
        }
      }
    }
  }

  .previewpromptdialog {
    .content {
      display: flex;
      padding: 0;
      font-size: 0.6rem;
      word-break: break-all;

      .prompt:first-child {
        span {
          padding: 0;
        }
      }

      .prompt {
        display: inline-block;
        flex: 1;

        h5 {
          margin: 0 0 0.5rem 0;
          // text-align: center;
        }

        span {
          display: block;
          // padding: 0 0 0 0.5rem;
          font-size: 0.5rem;
          text-align: center;
          text-align: left;
        }

        p {
          display: block;
          font-size: 0.4rem;
          padding: 0.2rem 0;
        }
      }

      .divider {
        display: inline-block;
        // margin: 0.7rem 0.3rem 0 0.3rem;
        margin: 0 0.5rem;
        width: 1px;
        height: auto;
        min-height: 100%;
        background-color: #666;
      }
    }
  }
}
</style>
