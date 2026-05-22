// Safely prevent uncaught crashes due to 'ethereum' redefinition issues from browser extensions or iframes.
try {
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    try {
      return originalDefineProperty.apply(this, arguments);
    } catch (err) {
      if (prop === 'ethereum') {
        console.warn("Bypassed non-configurable redefinition for 'ethereum':", err);
        return obj;
      }
      throw err;
    }
  };

  const originalDefineProperties = Object.defineProperties;
  Object.defineProperties = function(obj, props) {
    try {
      return originalDefineProperties.apply(this, arguments);
    } catch (err) {
      if (props && Object.prototype.hasOwnProperty.call(props, 'ethereum')) {
        console.warn("Bypassed non-configurable defineProperties for 'ethereum':", err);
        for (const key in props) {
          if (Object.prototype.hasOwnProperty.call(props, key)) {
            try {
              originalDefineProperty(obj, key, props[key]);
            } catch (e) {
              console.warn(`Bypassed safe definition failure for key: ${key}`, e);
            }
          }
        }
        return obj;
      }
      throw err;
    }
  };
} catch (e) {
  console.error("Failed to inject ethereum redefinition guard in main.tsx:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
