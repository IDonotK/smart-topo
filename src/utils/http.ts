import axios from 'axios';
import { Message } from 'element-ui';
axios.defaults.timeout = 30 * 1000;
axios.interceptors.response.use(
  (res) => {
    // @ts-ignore
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
          res.data.errorMessage = '获取场景配置数据错误：' + res.data.errorMessage;
          break;
        case 'events':
          res.data.errorMessage = '获取事件数据错误：' + res.data.errorMessage;
          break;
        case 'endpoints':
          res.data.errorMessage = '获取全部拓扑数据错误：' + res.data.errorMessage;
          break;
        case 'applications':
          res.data.errorMessage = '获取上下游数据错误：' + res.data.errorMessage;
          break;
        case 'underlying-resources':
          res.data.errorMessage = '获取纵向依赖数据错误：' + res.data.errorMessage;
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
      return;
    }
    return res;
  },
  (err) => {
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = '请求错误(400)';
          break;
        case 401:
          err.message = '未授权，请重新登录(401)';
          break;
        case 403:
          err.message = '拒绝访问(403)';
          break;
        case 404:
          err.message = '请求出错(404)';
          break;
        case 408:
          err.message = '请求超时(408)';
          break;
        case 500:
          err.message = '服务器错误(500)';
          break;
        case 501:
          err.message = '服务未实现(501)';
          break;
        case 502:
          err.message = '网络错误(502)';
          break;
        case 503:
          err.message = '服务不可用(503)';
          break;
        case 504:
          err.message = '网络超时(504)';
          break;
        case 505:
          err.message = 'HTTP版本不受支持(505)';
          break;
        default:
          err.message = `连接出错(${err.response.status})!`;
      }
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
          err.message = '获取场景配置数据错误：' + err.message;
          break;
        case 'events':
          err.message = '获取事件数据错误：' + err.message;
          break;
        case 'endpoints':
          err.message = '获取全部拓扑数据错误：' + err.message;
          break;
        case 'applications':
          err.message = '获取上下游数据错误：' + err.message;
          break;
        case 'underlying-resources':
          err.message = '获取纵向依赖数据错误：' + err.message;
          break;
        default:
          break;
      }
    } else {
      err.message = '连接服务器失败!';
    }
    Message.error({
      showClose: true,
      message: err.message,
      type: 'error',
      duration: 5000,
    });
    return Promise.resolve(err.response);
  },
);
