import React from 'react';
import ReactDOM from 'react-dom';

import'antd-mobile/dist/antd-mobile.css';

// 必须要将 css样式文件 放在组件样式的后面，这样才会生效，否则会被覆盖
import './index.css';

// 导入字体图标的 css 样式
import './assets/fonts/iconfont.css'

// 导入 react-virtualized 的样式文件
import 'react-virtualized/styles.css';

// 最后导入组件 样式
import App from './App';

ReactDOM.render(
  // 方式一
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  // 方式二
  <App />,
  document.getElementById('root')
);
