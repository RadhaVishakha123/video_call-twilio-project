// import { StrictMode } from 'react';
// import * as ReactDOM from 'react-dom/client';
// import App from './app/app';

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );

// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css';
import App from './app/app';
import { ConfigProvider, App as AntdApp } from 'antd';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <ConfigProvider theme={{cssVar: {prefix: 'antd',
      key: 'theme'}
   }}
   >
    <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)