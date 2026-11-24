<template>
  <div class="inpaintsettings_wrapper">
    <el-scrollbar class="setting">
      <a-form
        class="input_container"
        ref="formDataRef"
        label-position="left"
        :model="state.formData"
      >
        <div class="content">
          <div class="top">
            <CommonUpload
              :attachmentList="state.formData.fileList"
              :maxCount="1"
              @change="handleUpload"
            />

            <a-button
              class="previewprompt"
              type="primary"
              @click="handlePreviewPrompt"
            >
              预览提示词
            </a-button>
          </div>
          <img
            v-if="state.formData.maskBase64Data !== ''"
            :src="state.formData.maskBase64Data"
            alt=""
            class="maskviewer"
          />
          <MaskEditor
            :imageSrc="state.formData.imageSrc"
            @change="handleChangeMask"
          />
        </div>
        <div class="content">
          <div class="header"></div>

          <a-tabs
            v-model:activeKey="state.positivePromptContentTabActive"
            type="card"
          >
            <a-tab-pane key="option">
              <template #tab>
                <div class="positiveprompttablabel">
                  <span class="checkbox">
                    <a-checkbox v-model:checked="isUsingCustomPsitivePrompt"></a-checkbox>
                  </span>
                  <span class="label">&nbsp&nbsp自定义提示词 </span>
                </div>
              </template>
              <a-textarea
                :rows="5"
                clearable
                autocomplete="off"
                v-model:value="state.formData.customPositivePrompt"
                @change="handleChangeCustomPositivePrompt"
                :placeholder="submitInputPlaceholder"
              ></a-textarea>
            </a-tab-pane>
            <a-tab-pane key="custom">
              <template #tab>
                <div class="positiveprompttablabel">
                  <span class="checkbox">
                    <a-checkbox v-model:checked="isUsingOptionalPositivePrompt"></a-checkbox>
                  </span>
                  <span class="label">&nbsp&nbsp选项提示词 </span>
                </div>
              </template>
              <el-scrollbar
                class="promptarea"
                max-height="6rem"
              >
                <ul
                  v-for="(item1, index1) in state.formData.positivePromptListWithCategory"
                  :key="item1.id"
                >
                  <li
                    v-for="(item2, index2) in getActiveTag(item1.content)"
                    :key="item2.id"
                  >
                    <a-tag
                      :key="item2.id"
                      closable
                      bordered
                      :color="item1.color"
                      @close="handleCloseTag(item2)"
                    >
                      {{ item2.title }}
                    </a-tag>
                  </li>
                </ul>
              </el-scrollbar>
            </a-tab-pane>
          </a-tabs>
        </div>
        <a-collapse
          v-model:activeKey="state.collapsedSettings1"
          class="content"
          @change="handleChangeCollpase1($event)"
        >
          <a-collapse-panel
            header="使用反向提示词"
            name="useNegativePrompt"
            class="settingitem"
          >
            <template #extra>
              <a-form-item>
                <div class="settingitemcontent">
                  <span class="switchertitle"></span>
                  <div class="switcher">
                    <a-switch
                      v-model:checked="state.useNegativePrompt"
                      @change="(checked: boolean | string | number, event: Event)=>{
                        // state.useNegativePrompt=!value
                        // emitOnSettingChanged()
                      }"
                    >
                    </a-switch>
                  </div>
                </div>
              </a-form-item>
            </template>
            <div class="content">
              <a-tabs
                v-model:activeKey="state.negativePromptContentTabActive"
                type="card"
              >
                <a-tab-pane key="option">
                  <template #tab>
                    <div class="positiveprompttablabel">
                      <span class="checkbox">
                        <a-checkbox v-model:checked="isUsingCustomNegativePrompt"></a-checkbox>
                      </span>
                      <span class="label">&nbsp&nbsp自定义反向提示词 </span>
                    </div>
                  </template>
                  <a-textarea
                    :rows="5"
                    clearable
                    autocomplete="off"
                    v-model:value="state.formData.customNegativePrompt"
                    @change="handleChangeCustomNegativePrompt"
                    :placeholder="submitInputPlaceholder"
                  ></a-textarea>
                </a-tab-pane>
                <a-tab-pane key="custom">
                  <template #tab>
                    <div class="positiveprompttablabel">
                      <span class="checkbox">
                        <a-checkbox v-model:checked="isUsingOptionalNegativePrompt"></a-checkbox>
                      </span>
                      <span class="label">&nbsp&nbsp选项反向提示词 </span>
                    </div>
                  </template>
                  <el-scrollbar
                    class="promptarea"
                    max-height="6rem"
                  >
                    <ul
                      v-for="(item1, index1) in state.formData.negativePromptListWithCategory"
                      :key="index1"
                    >
                      <li
                        v-for="item2 in getActiveTag(item1.content)"
                        :key="item2.id"
                      >
                        <a-tag
                          :key="item2.id"
                          closable
                          bordered
                          :color="item1.color"
                          @close="handleCloseTag(item2)"
                        >
                          {{ item2.title }}
                        </a-tag>
                      </li>
                    </ul>
                  </el-scrollbar>
                </a-tab-pane>
              </a-tabs>
            </div>
          </a-collapse-panel>
        </a-collapse>
        <a-form-item label="Base步数">
          <a-row :gutter="40">
            <a-col :span="17">
              <a-slider
                v-model:value="state.formData.numInferenceSteps"
                :max="state.useLcmLora ? 8 : 200"
                :min="state.useLcmLora ? 1 : 3"
                show-input
                size="small"
                :marks="stepMarksBase"
              />
            </a-col>
            <a-col :span="7">
              <a-input-number
                v-model:value="state.formData.numInferenceSteps"
                :max="state.useLcmLora ? 8 : 200"
                :min="state.useLcmLora ? 1 : 3"
                :step="1"
              />
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item label="重绘强度">
          <a-row :gutter="40">
            <a-col :span="17">
              <a-slider
                v-model:value="state.formData.strength"
                :max="1"
                :min="0"
                :step="0.1"
                show-input
                size="small"
                :marks="stepMarksWithin1"
              />
            </a-col>
            <a-col :span="7">
              <a-input-number
                v-model:value="state.formData.strength"
                :max="1"
                :min="0"
                :step="0.1"
              />
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item label="提示词权重">
          <a-row :gutter="40">
            <a-col :span="17">
              <a-slider
                v-model:value="state.formData.guidanceScale"
                :max="12"
                :min="1"
                :step="1"
                show-input
                size="small"
                :marks="parseStepMarks(15)"
              />
            </a-col>
            <a-col :span="7">
              <a-input-number
                v-model:value="state.formData.guidanceScale"
                :max="12"
                :min="1"
                :step="1"
              />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="去噪结束点">
          <a-row :gutter="40">
            <a-col :span="17">
              <a-slider
                v-model:value="state.formData.denoisingEnd"
                :max="1"
                :min="0"
                :step="0.1"
                show-input
                size="small"
                :marks="stepMarksWithin1"
              />
            </a-col>
            <a-col :span="7">
              <a-input-number
                v-model:value="state.formData.denoisingEnd"
                :max="1"
                :min="0"
                :step="0.1"
              />
            </a-col>
          </a-row>
        </a-form-item>

        <a-collapse
          v-model:activeKey="state.collapsedSettings2"
          class="content"
          @change="handleChangeCollpase2($event)"
        >
          <a-collapse-panel
            header="使用Refiner"
            name="useRefiner"
            class="userefuner settingitem"
          >
            <template #extra>
              <a-form-item>
                <div class="settingitemcontent">
                  <span class="switchertitle"></span>
                  <div class="switcher">
                    <a-switch
                      v-model:checked="state.useRefiner"
                      @change="handleChangeUseRefiner"
                    >
                    </a-switch>
                  </div>
                </div>
              </a-form-item>
            </template>
            <div class="content">
              <a-row>
                <a-col :span="24">
                  <a-form-item label="Refiner步数">
                    <a-slider
                      v-model:value="state.formData.numInferenceStepsRefiner"
                      :max="50"
                      :min="5"
                      size="small"
                      :marks="stepMarksRefiner"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="24">
                  <a-form-item label="去噪起始点">
                    <a-slider
                      v-model:value="state.formData.denoisingStart"
                      :max="1"
                      :min="0"
                      :step="0.1"
                      size="small"
                      :marks="stepMarksWithin1"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-collapse-panel>
          <a-collapse-panel
            header="指定种子"
            name="setSeed"
            class="settingitem"
          >
            <template #extra>
              <a-form-item>
                <div class="settingitemcontent">
                  <span class="switchertitle"></span>
                  <div class="switcher">
                    <a-switch
                      v-model:checked="state.setSeed"
                      @change="(value: boolean | string | number)=>{
                        state.setSeed=!value
                        emitOnSettingChanged()
                      }"
                    >
                    </a-switch>
                  </div>
                </div>
              </a-form-item>
            </template>
            <div class="content">
              <a-row>
                <a-col :span="23">
                  <a-form-item label="种子">
                    <a-input
                      v-model:value="state.formData.seed"
                      type="number"
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <a-form
          class="form"
          ref="formDataRef"
          label-position="top"
          label-width="60px"
        >
          <a-row>
            <a-col :span="24">
              <a-form-item label="图片尺寸">
                {{ state.formData.width }} * {{ state.formData.height }}
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item label="宽度">
                <a-slider
                  v-model:value="state.formData.width"
                  :max="6144"
                  :min="320"
                  show-input
                  size="small"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="steps">
            <a-col :span="24">
              <a-form-item label="高度">
                <a-slider
                  v-model:value="state.formData.height"
                  :max="6144"
                  :min="320"
                  show-input
                  size="small"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-form>
    </el-scrollbar>
    <DialogPreviewPrompt
      :image="state.formData.imageSrc"
      :mask="state.formData.maskBase64Data"
      :previewPromptVisible="state.previewPromptVisible"
      :customPositivePrompt="state.formData.customPositivePrompt"
      :positivePromptList="state.formData.positivePromptListWithCategory"
      :customNegativePrompt="state.formData.customNegativePrompt"
      :negativePromptList="state.formData.negativePromptListWithCategory"
      :useNegativePrompt="state.useNegativePrompt"
      :width="state.formData.width"
      :height="state.formData.height"
      :numInferenceSteps="state.formData.numInferenceSteps"
      :useRefiner="state.useRefiner"
      :numInferenceStepsRefiner="state.formData.numInferenceStepsRefiner"
      :setSeed="state.setSeed"
      :seed="state.formData.seed"
      @onCloseDialog="handleClosePreviewDialog"
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

import type { UploadFile } from 'ant-design-vue';
import CommonUpload from '@/components/CommonUpload.vue';
import DialogPreviewPrompt from '@/views/Img2Img/DialogPreviewPrompt.vue';

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
  formData: {
    maskBase64Data: '',
    imageSrc: '',
    fileList: [],

    positivePrompt: '',
    negativePrompt: '',
    customPositivePrompt: '',
    customNegativePrompt: '',
    positivePromptListWithCategory: [] as any,
    negativePromptListWithCategory: [] as any,
    strength: 0.5,
    guidanceScale: 7.5,
    denoisingEnd: 0.8,
    denoisingStart: 0.8,
    numInferenceSteps: 80,
    numInferenceStepsRefiner: 20,
    width: 940,
    height: 1280,
    // seed: null as number | null,
    seed: undefined,
  },
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
  useRefiner: true,
  useFp32: false,
  useLcmLora: false,
  sampler: 'DPM++ 2M Karras',
  setSeed: false,
  imageContentCategoryList: [] as any,

  imageSrc: '',

  settings: {} as any,
  appliedSeed: false,
});

const promptListCacheData = computed(() => {
  return global.$store.state.app.promptListCacheData;
}) as any;

const promptCategoryListCacheData = computed(() => {
  return global.$store.state.app.promptCategoryListCacheData;
}) as any;

const submitInputPlaceholder = computed(() => {
  return global.$isMobile() ? '' : '';
}) as any;

const currentPreviewList = computed(() => global.$store.state.app.currentPreviewList) as any;

const stepMarksBase = computed(() => {
  return parseStepMarks(200);
}) as any;

const stepMarksRefiner = computed(() => {
  return parseStepMarks(50);
}) as any;

const stepMarksWithin1 = computed(() => {
  return parseStepMarks(1, 2);
}) as any;

const parseStepMarks = (range: number, marksCount: number = 5) => {
  const result = {} as any;
  const step = range / marksCount;
  for (let index = 0; index < marksCount; index++) {
    result[step * (index + 1)] = step * (index + 1) + '';
  }
  console.log(result);
  return result;
};

const isUsingCustomPsitivePrompt = computed(() => {
  return global.$isNotEmpty(state.formData.customPositivePrompt);
});

const isUsingOptionalPositivePrompt = computed(() => {
  let result = false;
  state.formData.positivePromptListWithCategory.forEach((item: any) => {
    if (!result && item.content) {
      if (item.content.filter((item2: any) => item2.active).length > 0) {
        result = true;
      }
    }
  });
  return result;
});

const isUsingCustomNegativePrompt = computed(() => {
  return global.$isNotEmpty(state.formData.customNegativePrompt);
});

const isUsingOptionalNegativePrompt = computed(() => {
  let result = false;
  state.formData.negativePromptListWithCategory.forEach((item: any) => {
    if (!result && item.content) {
      if (item.content.filter((item2: any) => item2.active).length > 0) {
        result = true;
      }
    }
  });
  return result;
});

watch(
  () => state.formData.width,
  (newValue: any) => {
    console.log('waatch state.formData.width++++', newValue);
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
    state.formData.seed = newValue;
  }
);

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
  state.formData.positivePromptListWithCategory.forEach((item: any) => {
    if (randomListIndex === randomList.length) {
      randomListIndex = 0;
    }
    item.color = global.$store.state.app.tagTypeDictionary[randomList[randomListIndex]];
    randomListIndex++;
  });
  state.formData.negativePromptListWithCategory.forEach((item: any) => {
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

  state.formData.positivePromptListWithCategory = positivePromptListWithCategory;
  state.formData.negativePromptListWithCategory = negativePromptListWithCategory;
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
  emitOnSettingChanged();
};

const emitOnSettingChanged = () => {
  console.log(state.formData);
  state.settings = {
    useNegativePrompt: state.useNegativePrompt,
    numInferenceSteps: state.formData.numInferenceSteps,
    strength: state.formData.strength,
    guidanceScale: state.formData.guidanceScale,
    denoisingEnd: state.formData.denoisingEnd,
    numInferenceStepsRefiner: state.formData.numInferenceStepsRefiner,
    denoisingStart: state.formData.denoisingStart,
    useRefiner: state.useRefiner,
    useFp32: state.useFp32,
    useLcmLora: state.useLcmLora,
    sampler: state.sampler,
    setSeed: state.setSeed,
    seed: state.formData.seed,
  };
  emit('onSettingChanged', Object.assign(state.formData, state.settings));
};

const handleChangeUseRefiner = (value: any) => {
  state.useRefiner = !value;
  emitOnSettingChanged();
};

const checkIfCheckAll = (promptType: string, category: string) => {
  let result: string | boolean = false;
  let promptListByCategoryData = [] as any;
  if (promptType === 'positive') {
    promptListByCategoryData = state.formData.positivePromptListWithCategory.find(
      (item: any) => item.value === category
    );
  }

  if (promptType === 'negative') {
    promptListByCategoryData = state.formData.negativePromptListWithCategory.find(
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

const handleCloseTag = async (data: any) => {
  // 123
  state.formData.positivePromptListWithCategory.forEach((item1: any) => {
    item1.content.forEach((item2: any) => {
      if (item2.id === data.id) {
        item2.active = false;
      }
    });
  });

  state.formData.negativePromptListWithCategory.forEach((item1: any) => {
    item1.content.forEach((item2: any) => {
      if (item2.id === data.id) {
        item2.active = false;
      }
    });
  });

  emitPositivePromptString();
  emitNegativePromptString();

  $forceUpdate();
};

const transformPromptOptionsToString = () => {
  let positivePromptString = '';
  let negativePromptString = '';

  state.formData.positivePromptListWithCategory.forEach((item: any) => {
    const activeList = getActiveTag(item.content);
    positivePromptString += activeList.map((item2: any) => item2.value.trim());
    if (activeList.length > 0) positivePromptString += ',';
  });
  state.formData.negativePromptListWithCategory.forEach((item: any) => {
    const activeList = getActiveTag(item.content);
    negativePromptString += activeList.map((item2: any) => item2.value.trim());
    if (activeList.length > 0) negativePromptString += ',';
  });
  state.formData.positivePromptString = positivePromptString;
  state.formData.negativePromptString = negativePromptString;
};

const handlePreviewPrompt = () => {
  state.previewPromptVisible = true;
};

const handleClosePreviewDialog = () => {
  state.previewPromptVisible = false;
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
      state.formData[item] = defaultSettingsObject[item];
    });
  } catch (error) {
    return;
  }
};

const emitPositivePromptString = () => {
  transformPromptOptionsToString();
  emit('onPositivePromptChanged', {
    options: state.formData.positivePromptString,
    custom: state.formData.customPositivePrompt,
  });
};

const emitNegativePromptString = () => {
  transformPromptOptionsToString();
  emit('onNegativePromptChanged', {
    options: state.formData.negativePromptString,
    custom: state.formData.customNegativePrompt,
  });
};

const handleChangeCustomPositivePrompt = () => {
  emitPositivePromptString();
};

const handleChangeCustomNegativePrompt = () => {
  emitNegativePromptString();
  emitOnSettingChanged();
};

const handleChooseRatio = (index: number) => {
  state.ratioSettingsDictionary.forEach((item: any, index2: number) => {
    item.active = index === index2;
  });
  state.sizePresetListTop = getPresetSizeTop();
  state.sizePresetListBottom = getPresetSizeBottom();
  emitOnSettingChanged();
};

const handleChangeCollpase1 = (key: any) => {
  console.log(key);
  state.useNegativePrompt = key.some((item: string) => item === '0');
  emit('onChangeUseNegativePrompt', state.useNegativePrompt);
  emitOnSettingChanged();
};
const handleChangeCollpase2 = (key: any) => {
  console.log(key);
  state.useRefiner = key.some((item: string) => item === '0');
  state.setSeed = key.some((item: string) => item === '1');
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

  state.formData.positivePromptListWithCategory.forEach((item: any, index1: number) => {
    item.content.forEach((item2: any, index2: number) => {
      state.formData.positivePromptListWithCategory[index1].content[index2].active =
        !!chosenPositivePromptData.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('positive', item.value);
  });
  state.formData.negativePromptListWithCategory.forEach((item: any, index1: number) => {
    item.content.forEach((item2: any, index2: number) => {
      state.formData.negativePromptListWithCategory[index1].content[index2].active =
        !!chosenNegativePromptData.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('negative', item.value);
  });

  state.formData.positivePromptString = chosenPositivePreviewDataString;
  state.formData.negativePromptString = chosenNegativePreviewDataString;

  console.log(chosenPreviewData);

  state.formData.customNegativePrompt = chosenPreviewData.customNegativePrompt;
  state.formData.customPositivePrompt = chosenPreviewData.customPositivePrompt;

  state.setSeed = global.$isNotEmpty(chosenPreviewData.seed);
  state.formData.seed = chosenPreviewData.seed;
  state.formData.width = chosenPreviewData.width;
  state.formData.height = chosenPreviewData.height;

  state.useNegativePrompt =
    global.$isNotEmpty(chosenPreviewData.customNegativePrompt) ||
    global.$isNotEmpty(chosenNegativePreviewDataString);

  state.formData.numInferenceSteps = chosenPreviewData.numInferenceSteps;
  state.formData.numInferenceStepsRefiner = chosenPreviewData.numInferenceStepsRefiner;

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
  console.log(state.formData.positivePromptListWithCategory);

  state.formData.positivePromptListWithCategory.forEach(async (item: any) => {
    item.content.forEach((item2: any) => {
      item2.active = !!positivePromptList.find((item3: any) => item3 === item2.value);
    });

    item.checkAll = checkIfCheckAll('positive', item.value);
  });
  console.log('positivePromptListWithCategory');
  console.log(state.formData.positivePromptListWithCategory);
  state.formData.negativePromptListWithCategory.forEach((item: any) => {
    item.content.forEach((item2: any) => {
      item2.active = !!negativePromptList.find((item3: any) => item3 === item2.value);
    });
    item.checkAll = checkIfCheckAll('negative', item.value);
  });

  state.formData.customPositivePrompt = applySettingsData.customPositivePrompt;
  state.formData.customNegativePrompt = applySettingsData.customNegativePrompt;

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
  state.formData.width = applySettingsData.width;
  state.formData.height = applySettingsData.height;
  state.formData.numInferenceSteps = applySettingsData.numInferenceSteps;
  state.formData.numInferenceStepsRefiner = applySettingsData.numInferenceStepsRefiner || 0;
  state.formData.seed = applySettingsData.seed ? Number(applySettingsData.seed) : null;

  matchRatioSetting(applySettingsData);

  emitPositivePromptString();
  emitNegativePromptString();
  emitOnSettingChanged();
  setTimeout(() => {
    global.$store.commit('app/updateApplySettingsUsed', true);
  }, 2000);

  emit(
    'onSettingChanged',
    Object.assign(state.formData, {
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

const handleUpload = (data: UploadFile) => {
  console.log('handleUpload');
  console.log(data);
  state.formData.imageSrc = data.response.filePath;
  state.formData.width = data.response.width;
  state.formData.height = data.response.height;
  emit(
    'onSettingChanged',
    Object.assign(state.formData, {
      width: data.response.width,
      height: data.response.height,
      imageSrc: data.response.filePath,
    })
  );
};

const handleChangeMask = (payload: string) => {
  state.formData.maskBase64Data = payload.maskBase64;
  emit('onSettingChanged', state.formData);
  console.log(payload);
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

<style lang="scss" scoped>
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
          margin: 1rem 0 0 0;
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
