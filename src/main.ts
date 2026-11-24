import app from '@/utils/appInstance';

import 'normalize.css';
import 'element-plus/theme-chalk/el-loading.css';
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-notification.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/el-drawer.css';

app.mount('#app');

import '@/utils/permission.ts';

export default app;
