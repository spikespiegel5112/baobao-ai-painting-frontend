<template>
  <div class="common_promptselector_wrapper">
    <a-tabs
      class="promitdirectiontabs"
      type="card"
      v-model:activeKey="state.promptTabActive"
    >
      <a-tab-pane
        tab="正向"
        key="positive"
      >
        <el-scrollbar v-loading="state.loadingFlag">
          <li
            class="block"
            v-for="(item2, index2) in state.settings.positivePromptListWithCategory"
            :key="index2"
          >
            <h5>
              <span>{{ item2.title }}</span>
              <a-checkbox
                v-model:checked="item2.checkAll"
                :indeterminate="item2.checkAll === 'intermediate'"
                @change="handleCheckCheckAll($event, item2)"
              >
                全选
              </a-checkbox>
            </h5>
            <ul class="content">
              <li
                v-for="(item3, index3) in item2.content"
                :key="item3.id"
                :class="{ active: item3.active }"
              >
                <a-button
                  :type="item3.active ? 'primary' : undefined"
                  @click="handleChoosePositivePrompt(item2, item3, index2, index3)"
                >
                  {{ item3.title }}
                </a-button>
              </li>
            </ul>
          </li>
        </el-scrollbar>
      </a-tab-pane>
      <a-tab-pane
        tab="反向"
        key="negative"
      >
        <el-scrollbar v-loading="state.loadingFlag">
          <li
            class="block"
            v-for="(item2, index2) in state.settings.negativePromptListWithCategory"
            :key="item2.id"
          >
            <h5>
              <span>{{ item2.title }}</span>
              <a-checkbox
                v-model:checked="item2.checkAll"
                :indeterminate="item2.checkAll === 'intermediate'"
                @change="handleCheckCheckAll($event, item2)"
              >
                全选
              </a-checkbox>
            </h5>
            <ul class="content">
              <li
                v-for="(item3, index3) in item2.content"
                :key="item3.id"
                :class="{ active: item3.active }"
              >
                <a-button
                  :type="item3.active ? 'primary' : undefined"
                  @click="handleChooseNegativePrompt(item2, item3, index2, index3)"
                >
                  {{ item3.title }}
                </a-button>
              </li>
            </ul>
          </li>
        </el-scrollbar>
      </a-tab-pane>
    </a-tabs>
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
  (e: 'onChange', data: any): void;
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

const promptListCacheData = computed(() => {
  return global.$store.state.app.promptListCacheData;
}) as any;

const promptCategoryListCacheData = computed(() => {
  return global.$store.state.app.promptCategoryListCacheData;
}) as any;

const currentPreviewList = computed(() => global.$store.state.app.currentPreviewList) as any;

const getImageCategoryDictionaryPromise = () => {
  return new Promise((resolve, reject) => {
    dictionaryManagementGetRequest({
      category: 'imageContentCategory',
    })
      .then((response: any) => {
        resolve(response);
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
};

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

const handleChoosePositivePrompt = async (
  item2: any,
  item3: any,
  index2: number,
  index3: number
) => {
  const active: boolean =
    state.settings.positivePromptListWithCategory[index2].content[index3].active;
  state.settings.positivePromptListWithCategory[index2].content[index3].active = !active;

  emitPositivePromptString();
  item2.checkAll = checkIfCheckAll('positive', item2.value);
};

const handleChooseNegativePrompt = (item2: any, item3: any, index2: number, index3: number) => {
  const active: boolean =
    state.settings.negativePromptListWithCategory[index2].content[index3].active;
  state.settings.negativePromptListWithCategory[index2].content[index3].active = !active;
  emitNegativePromptString();

  item2.checkAll = checkIfCheckAll('negative', item3.value);
};

const handleCheckCheckAll = (event: any, item1: any) => {
  item1.content.forEach((item2: any) => {
    if (typeof event.target.checked === 'boolean') {
      item2.active = event.target.checked;
    } else {
      item2.active = false;
    }
  });
  emitPositivePromptString();
  emitNegativePromptString();
};

const getData = () => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      if (
        promptListCacheData.value.length === 0 ||
        promptCategoryListCacheData.value.length === 0
      ) {
        console.warn('save cache!!!!');
        state.loadingFlag = true;

        state.imageContentCategoryList = await getImageCategoryDictionaryPromise();

        const promptList = await promptManagementGetRequest({});
        state.promptList = promptList.data.map((item: any) => {
          return Object.assign(item, {
            value: item.value.trim(),
          });
        });
        const promptCategoryList = await promptCategoryManagementGetRequest({});
        state.promptCategoryList = promptCategoryList.data;
        global.$store.commit('app/updatePromptListCacheData', state.promptList);
        global.$store.commit('app/updatePromptCategoryListCacheData', state.promptCategoryList);
        resolve();
      } else {
        console.warn('cached!!!!');
        state.promptList = promptListCacheData.value;
        state.promptCategoryList = promptCategoryListCacheData.value;
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};

const initRandomPromptColor = () => {
  let result = [] as string[];
  const tagTypeDictionary: any[] = global.$store.state.app.tagTypeDictionary;
  const randomList = global.$generateRandom(tagTypeDictionary.length);
  let randomListIndex = 0;

  state.settings.positivePromptListWithCategory.forEach((item: any) => {
    if (randomListIndex === randomList.length) {
      randomListIndex = 0;
    }
    item.color = global.$store.state.app.tagTypeDictionary[randomList[randomListIndex]];
    randomListIndex++;
  });
  state.settings.negativePromptListWithCategory.forEach((item: any) => {
    if (randomListIndex === randomList.length) {
      randomListIndex = 0;
    }
    item.color = global.$store.state.app.tagTypeDictionary[randomList[randomListIndex]];
    randomListIndex++;
  });

  return result;
};

const initData = async () => {
  const positivePromptList = state.promptList.filter((item: any) => item.direction === 'positive');
  const negativePromptList = state.promptList.filter((item: any) => item.direction === 'negative');

  const positivePromptListWithCategory = JSON.parse(
    JSON.stringify(
      state.promptCategoryList.filter((item1: any) => {
        return positivePromptList.filter((item2: any) => item2.category === item1.value).length > 0;
      })
    )
  );

  positivePromptListWithCategory.forEach((item: any) => {
    item.checkAll = false;
    item.content = positivePromptList
      .filter((item2: any) => item2.category === item.value)
      .map((item2: any) => {
        return Object.assign(item2, {
          active: false,
        });
      });
  });

  const negativePromptListWithCategory = JSON.parse(
    JSON.stringify(
      state.promptCategoryList.filter((item1: any) => {
        return negativePromptList.filter((item2: any) => item2.category === item1.value).length > 0;
      })
    )
  );
  negativePromptListWithCategory.forEach((item: any) => {
    item.checkAll = false;
    item.content = negativePromptList
      .filter((item2: any) => item2.category === item.value)
      .map((item2: any) => {
        return Object.assign(item2, {
          active: false,
        });
      });
  });

  state.settings.positivePromptListWithCategory = positivePromptListWithCategory;
  state.settings.negativePromptListWithCategory = negativePromptListWithCategory;
  state.loadingFlag = false;

  state.sizePresetListTop = getPresetSizeTop();
  state.sizePresetListBottom = getPresetSizeBottom();

  if (!global.$store.state.app.applySettingsUsed) {
    applySettings();
  } else {
    initCachedSettingData(currentPreviewList.value.length - 1);
  }

  emitPositivePromptString();
  emitNegativePromptString();
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
  emit('onChange', {
    prompt: state.settings.positivePromptListWithCategory,
    promptString: state.settings.positivePromptString,
    direction: 'positive',
  });
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

onMounted(async () => {
  await getModelInfoPromise();
  await getData();
  parseDefaultSettings();
  initData();
  initRandomPromptColor();
  global.$NProgress.done();
});

onBeforeUnmount(() => {
  state.onProgress = false;
});
</script>

<style lang="scss">
html.dark {
  .common_promptselector_wrapper {
    .ant-tabs {
      &.promitdirectiontabs {
        .ant-tabs-content-holder {
          .ant-tabs-content {
            .ant-tabs-tabpane {
              .el-scrollbar {
                .block {
                  > h5 {
                    background-color: #333;
                    color: #ccc;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
.common_promptselector_wrapper {
  margin: 0.9rem 0 0 0;
  padding: 0;
  min-width: 10rem;
  height: 100%;
  flex: 1;
  border-right: 1px solid #333;
  :deep(.a-tabs) {
    .ant-tabs-nav-list {
      margin: 0;
    }
  }
  :deep(.a-tabs--card) {
    > .ant-tabs-nav-list {
      .ant-tabs-nav-list {
        border-top: 1px solid #333;
        border-left: 1px solid transparent;
        border-right: 1px solid #333;
        border-bottom: none;
      }
    }
  }

  .ant-tabs {
    height: 100%;
    box-sizing: border-box;
    &.promitdirectiontabs {
      .ant-tabs-nav {
        margin: 0 0 0.1rem 0;
        width: 100%;
        // .ant-tabs-nav-wrap {
        //   width: 100%;
        //   .ant-tabs-nav-list {
        //     width: 100%;
        //     .ant-tabs-tab {
        //       flex: 1;
        //     }
        //   }
        // }
      }

      .ant-tabs-content-holder {
        height: calc(100vh - 2.9rem);

        .ant-tabs-content {
          height: 100%;

          .ant-tabs-tabpane {
            height: 100%;
            // border-left: 1px solid var(--el-border-color-light);
            // border-left: 1px solid #333;

            .el-scrollbar {
              height: 100%;

              .block {
                display: block;
                width: 100%;
                font-size: 0.4rem;

                > h5 {
                  display: flex;
                  padding: 0.1rem 0.5rem;
                  background-color: #eee;
                  color: #333;
                  justify-content: space-between;
                  align-items: center;
                }

                .content {
                  padding: 0.15rem 0;
                  display: flex;
                  flex-wrap: wrap;

                  li {
                    margin: 0.1rem 0.15rem 0.1rem 0.15rem;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  li {
    display: inline-block;
  }
}
</style>
