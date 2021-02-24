import axios from 'axios';
import { Message } from 'element-ui';
const status2ErrMsg = error => {
  let message = '';
  if (!error || !error.response || !error.response.status) {
    return message;
  }
  switch (error.response.status) {
    case 400:
      message = '请求错误(400)';
      break;
    case 401:
      message = '未授权，请重新登录(401)';
      break;
    case 403:
      message = '拒绝访问(403)';
      break;
    case 404:
      message = '请求出错(404)';
      break;
    case 408:
      message = '请求超时(408)';
      break;
    case 500:
      message = '服务器错误(500)';
      break;
    case 501:
      message = '服务未实现(501)';
      break;
    case 502:
      message = '网络错误(502)';
      break;
    case 503:
      message = '服务不可用(503)';
      break;
    case 504:
      message = '网络超时(504)';
      break;
    case 505:
      message = 'HTTP版本不受支持(505)';
      break;
    default:
      message = `连接出错(${error.response.status})!`;
  }
  return message;
};
axios.defaults.timeout = 30 * 1000;
axios.interceptors.response.use(
  res => {
    if (res.status && res.status === 200 && res.data.errorCode && res.data.errorMessage) {
      let urlArr = [];
      let targetUrl = '';
      if (res.config && res.config.url) {
        urlArr = res.config.url.split('/');
      }
      if (urlArr.length > 0) {
        targetUrl = urlArr[urlArr.length - 1];
      }
      switch (targetUrl) {
        case 'scene-config':
          res.data.errorMessage = `获取场景配置数据错误：${res.data.errorMessage}`;
          break;
        case 'events':
          res.data.errorMessage = `获取事件数据错误：${res.data.errorMessage}`;
          break;
        case 'endpoints':
          res.data.errorMessage = `获取全部拓扑数据错误：${res.data.errorMessage}`;
          break;
        case 'applications':
          res.data.errorMessage = `获取上下游数据错误：${res.data.errorMessage}`;
          break;
        case 'underlying-resources':
          res.data.errorMessage = `获取纵向依赖数据错误：${res.data.errorMessage}`;
          break;
        default:
          break;
      }
      Message.error({
        showClose: true,
        message: res.data.errorMessage,
        type: 'error',
        duration: 5000,
      });
    }
    return res;
  },
  err => {
    if (err && err.response) {
      err.message = status2ErrMsg(err);
      let urlArr = [];
      let targetUrl = '';
      if (err.response.config && err.response.config.url) {
        urlArr = err.response.config.url.split('/');
      }
      if (urlArr.length > 0) {
        targetUrl = urlArr[urlArr.length - 1];
      }
      switch (targetUrl) {
        case 'scene-config':
          err.message = `获取场景配置数据错误：${err.message}`;
          break;
        case 'events':
          err.message = `获取事件数据错误：${err.message}`;
          break;
        case 'endpoints':
          err.message = `获取全部拓扑数据错误：${err.message}`;
          break;
        case 'applications':
          err.message = `获取上下游数据错误：${err.message}`;
          break;
        case 'underlying-resources':
          err.message = `获取纵向依赖数据错误：${err.message}`;
          break;
        default:
          break;
      }
    } else {
      if (err.toString().indexOf('timeout') > -1) {
        err.message = '网络请求超时';
      } else {
        err.message = err.toString();
      }
    }
    if (!axios.isCancel(err)) {
      Message.error({
        showClose: true,
        message: err.message,
        type: 'error',
        duration: 5000,
      });
    }
    return Promise.reject(err);
  }
);
