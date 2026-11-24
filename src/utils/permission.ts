import router from '@/router';
// import { store } from "@/store";
import { utils } from './utils';

router.beforeEach(() => {
  utils.$NProgress.start();
});

router.afterEach((to, from) => {});

router.onError((error) => {
  console.log('router.onError', error);
  utils.$NProgress.done();
});
