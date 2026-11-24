<template>
  <div
    class="img2img_container"
    ref="img2imgContainerRef"
  >
    <div class="main">
      <div class="common_tab_container">
        <div class="mask"></div>
        <ul class="tabnav">
          <li
            v-for="item in state.tabList"
            :class="{ active: state.activeTab === item.name }"
          >
            <a @click="handleChooseTab(item)">
              {{ item.title }}
            </a>
          </li>
        </ul>
        <div class="tabpane">
          <Inpaint v-if="state.activeTab === 'Inpaint'" />
        </div>
      </div>
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

import Inpaint from './Inpaint.vue';

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties;

const loading = ref(true);

// const loadingInstance = ElLoading.service();
const state = reactive({
  activeTab: 'Inpaint',
  tabList: [
    {
      title: '重绘',
      name: 'Inpaint',
      component: 'inpaint',
    },
    {
      title: '联想',
      name: 'reimagine',
      component: 'Reimagine',
    },
  ],
});

watch(
  () => global.$router.currentRoute.value,
  (newValue: any, oldValue: any) => {}
);

const handleChooseTab = (item: any) => {
  state.activeTab = item.name;
};

onMounted(async () => {
  global.$NProgress.done();
});

onBeforeUnmount(() => {
  // state.onProgress = false;
});
</script>

<style lang="scss" scoped>
.img2img_container {
  width: 100%;
  height: 100vh;

  .main {
    margin: 1.5rem 0 0 0;
    height: calc(100% - 1.5rem);
  }
}

.common_tab_container {
  width: 100%;
  height: 100%;
  position: relative;

  .mask {
    backdrop-filter: blur(5px);
  }

  .tabnav {
    width: 100%;
    background-color: rgba($color: #333, $alpha: 1);
    border: 0;
    position: absolute;
    top: 0;
    left: 0;
    text-align: center;
    border: 0;
    z-index: 2;

    li {
      display: inline-block;
      min-width: 1.5rem;
      height: 0.8rem;
      line-height: 0.8rem;
      vertical-align: middle;

      &.active {
        a {
          background-color: #aaa;
          color: #000;

          &:hover {
            background-color: #aaa;
            color: #000;
          }
        }
      }

      a {
        display: inline-block;
        padding: 0;
        width: 100%;
        height: 100%;
        color: #fff;
        text-align: center;
        transition: all 0.3s;

        &:hover {
          background-color: #333;
          color: #fff;
        }
      }
    }
  }

  .tabpane {
    display: flex;
    height: 100%;
  }
}
</style>
