<template>
  <div
    class="generator_container"
    ref="generatorContainerRef"
  >
    <div class="chat_container">
      <el-scrollbar>
        <div class="main">
          <div
            class="content"
            v-if="state.readyFlag"
          >
            <PromptSDXL
              v-if="global.$store.state.app.currentModel === 'sdxl'"
              :promptList="state.promptList"
              :appliedSeed="state.appliedSeed"
              @onPositivePromptChanged="handlePositivePromptChanged"
              @onNegativePromptChanged="handleNegativePromptChanged"
              @onSettingChanged="handleSettingChanged"
              @onChangeUseNegativePrompt="handleIsUsingNegativeChanged"
            />
            <PromptSD3
              v-if="global.$store.state.app.currentModel === 'sd3'"
              :promptList="state.promptList"
              :appliedSeed="state.appliedSeed"
              @onPositivePromptChanged="handlePositivePromptChanged"
              @onNegativePromptChanged="handleNegativePromptChanged"
              @onSettingChanged="handleSettingChanged"
              @onChangeUseNegativePrompt="handleIsUsingNegativeChanged"
            />
            <PromptFlux
              v-if="global.$store.state.app.currentModel === 'flux'"
              :promptList="state.promptList"
              :appliedSeed="state.appliedSeed"
              @onPositivePromptChanged="handlePositivePromptChanged"
              @onNegativePromptChanged="handleNegativePromptChanged"
              @onSettingChanged="handleSettingChanged"
              @onChangeUseNegativePrompt="handleIsUsingNegativeChanged"
            />

            <Preview
              :positivePrompt="state.positivePrompt"
              :customPositivePrompt="state.customPositivePrompt"
              :negativePrompt="state.negativePrompt"
              :customNegativePrompt="state.customNegativePrompt"
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
        </div>
      </el-scrollbar>
    </div>
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
  ref,
  nextTick,
} from 'vue';

import PromptSDXL from './PromptSDXL.vue';
import PromptSD3 from './PromptSD3.vue';
import PromptFlux from './PromptFlux.vue';

import Preview from './Preview.vue';

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const loading = ref(true);

// const loadingInstance = ElLoading.service();
const state = reactive({
  positivePrompt: '',
  negativePrompt: '',
  customPositivePrompt: '',
  customNegativePrompt: '',
  // positivePrompt:
  //   "close-up photography of (grey tabby cat:1. 2) (cuts the fish with a knife on the table:1. 2), (c4ttitude:1. 3), in glasstech kitchen, hyper realistic, intricate detail, (foggy:1. 1), pov from below",
  // positivePrompt:
  //   "Highly detailed portrait of an elegant goddess with ornate clothing and beautiful face blond girl stunningly beautiful, ((open ass)), (perfect ass), smiling, Women Lingerie Lace Mesh Bride Role Play Costume, Set for Cosplay Party, huge boobs, beautiful, stunning, beautiful face , located in beautiful palace bedroom , pearlescent skin, intricate, elegant, highly detailed, (dark shot:1. 17), epic realistic, faded, ((neutral colors)), art, (hdr:1. 5), (muted colors:1. 2), hyperdetailed, (artstation:1. 5), cinematic, warm lights, dramatic light, (intricate details:1. 1), complex background, (rutkowski:0. 8), (teal and orange:0. 4)",
  // positivePrompt:
  //   'masterpiece, concept art, close shot, highly detailed, centered, 1girl in a (shiny color dress) standing in the rain, dreamy cyberpunk girl, cyberpunk art style, cyberpunk beautiful girl, cyberpunk girl, model girl, cyberpunk vibe, beautiful digital artwork, bright cyberpunk glow, cyberpunk vibrant colors, neon rainy cyberpunk setting, cyberpunk vibes, neon rain, cyberpunk art ultrarealistic 8k, has cyberpunk style',
  // customPositivePrompt:
  //   '8k wallpaper, highly detailed, illustration, 1 girl, long hair, detailed eyes, forrest, hanfu,lakes, soft smile,bamboo,Tea',
  // negativePrompt:
  //   'deformed, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, disgusting, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, blurry, ((((mutated hands and fingers)))), watermark, watermarked, oversaturated, censored, distorted hands, amputation, missing hands, obese, doubled face, double hands, deformed, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, malformed hands, out of focus, long neck, long body, monochrome, feet out of view, head out of view, lowres, ((bad anatomy)), bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, blurry, artist name, extra limb, poorly drawn eyes, (out of frame), black and white, obese, censored, bad legs, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, (extra legs), (poorly drawn eyes), without hands, bad knees, multiple shoulders, bad neck',
  useNegativePrompt: false,
  setSeed: false,
  useRefiner: false,
  useFp32: false,
  useLcmLora: false,
  sampler: '',
  chosenPreviewIndex: 0,
  promptList: [] as any,
  settings: {} as any,
  readyFlag: false,
  appliedSeed: null as number | null,
});

watch(
  () => global.$router.currentRoute.value,
  (newValue: any, oldValue: any) => {}
);

const initCachedPreviewData = () => {
  const txt2ImgSessionData = global.$getTxt2ImgSessionData();
  global.$store.commit('app/updateCurrentPreviewList', txt2ImgSessionData);
  state.readyFlag = true;
};

const handlePositivePromptChanged = (data: any) => {
  state.positivePrompt = data.options;
  state.customPositivePrompt = data.custom;
};

const handleNegativePromptChanged = (data: any) => {
  state.negativePrompt = data.options;
  state.customNegativePrompt = data.custom;
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

const handleIsUsingNegativeChanged = (value: boolean) => {
  state.useNegativePrompt = value;
};

const handleChoosePreview = (index: number) => {
  state.chosenPreviewIndex = index;
};

const handleApplySeed = (seed: number | null) => {
  state.appliedSeed = seed;
};

onMounted(async () => {
  initCachedPreviewData();
});

onBeforeUnmount(() => {
  // state.onProgress = false;
});
</script>

<style lang="scss" scoped>
.generator_container {
  display: flex;
  flex: 1;
  height: 100vh;
  flex-direction: column;
  color: #ccc;
  position: relative;
  box-sizing: border-box;

  .chat_container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    flex-direction: row;

    .main {
      padding: 1.5rem 0 0 0;
      width: 100%;
      height: 100vh;
      box-sizing: border-box;

      > .content {
        display: flex;
        // padding: 1.5rem 0 0 0;
        height: 100%;
        box-sizing: border-box;
        flex-direction: row;
      }

      > .operation {
        margin: 1rem 0 0 0;
        height: 3rem;
      }
    }
  }
}
</style>
