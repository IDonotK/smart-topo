import { SHORT_NAME_LENGTH, LINK_QPS_LEVELS } from '@/constants/topo';

const dateFormat = (fmt: string, date: Date) => {
  let ret: any;
  let res = fmt;
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    if (Object.prototype.hasOwnProperty.call(opt, k)) {
      ret = new RegExp(`(${k})`).exec(res);
      if (ret) {
        res = res.replace(ret[1], ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
      }
    }
  }
  return res;
};

/**
 * utc时间转北京时间
 * @param utc_datetime 2020-12-11T12:15:27.000+00:00
 * @return peking_datetime 2017-03-31 16:02:06
 */
const utc2Peking = utc_datetime => {
  let T_pos = utc_datetime.indexOf('T');
  let Z_pos = utc_datetime.indexOf('+');
  let year_month_day = utc_datetime.substr(0, T_pos);
  let hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  let new_datetime = `${year_month_day} ${hour_minute_second}`;

  // 处理成为时间戳
  let timestamp = new Date(Date.parse(new_datetime)).getTime() / 1000;

  // 增加8个小时，北京时间比utc时间多八个时区
  timestamp = timestamp + 8 * 60 * 60;

  // 时间戳转为时间
  let peking_datetime = dateFormat('YYYY-mm-dd HH:MM:SS', new Date(timestamp * 1000));
  return `${peking_datetime} +08:00`;
};

const getLinkQpsLevel = link => {
  if (link.label !== 'TracingTo' && link.label !== 'SubTracingTo') {
    return 1;
  }
  let levelTmp = LINK_QPS_LEVELS.find(level => link.callPerMinute >= level.min && link.callPerMinute < level.max);
  let qpsLevel = levelTmp === undefined ? 1 : Number(levelTmp.weight);
  return qpsLevel;
};

const fixTopoData = (originData, topoData) => {
  topoData.nodes.forEach(node => {
    if (node.name.length > SHORT_NAME_LENGTH) {
      node.shortName = `${node.name.substring(0, SHORT_NAME_LENGTH)}...`;
    } else {
      node.shortName = node.name;
    }
    node.type = node.label;

    // 事件等级
    node.eventCount = 0;
    node.eventLevel = '';
    if (originData.eventInfos) {
      for (let key in originData.eventInfos) {
        if (key === node.id) {
          node.eventCount = originData.eventInfos[key].eventCount;
          node.eventLevel = originData.eventInfos[key].eventLevel;
          break;
        }
      }
    }
    node.state = node.eventCount > 0 ? 'Abnormal' : 'Normal';

    // utc时间转北京时间
    node.createTime = utc2Peking(node.createTime);
    node.updateTime = utc2Peking(node.updateTime);
  });
  topoData.links.forEach(link => {
    link.type = link.label;
    link.sid = link.source;
    link.tid = link.target;
    link.qpsLevel = getLinkQpsLevel(link);
  });
};

const formatTopoData = (originResponse: any, isNeedFixField: boolean) => {
  let topoData = {
    nodes: [],
    links: [],
  };
  if (!originResponse || !originResponse.data) {
    return topoData;
  }

  let nodesTmp = [];
  let linksTmp = [];
  let originData = originResponse.data;

  if (originData.applications) {
    nodesTmp = [...nodesTmp, ...originData.applications];
  }
  if (originData.processes) {
    nodesTmp = [...nodesTmp, ...originData.processes];
  }
  if (originData.workloads) {
    nodesTmp = [...nodesTmp, ...originData.workloads];
  }
  if (originData.pods) {
    nodesTmp = [...nodesTmp, ...originData.pods];
  }
  if (originData.nodes) {
    nodesTmp = [...nodesTmp, ...originData.nodes];
  }
  if (originData.middleWares) {
    nodesTmp = [...nodesTmp, ...originData.middleWares];
  }
  topoData.nodes = nodesTmp;

  if (originData.tracingTos) {
    linksTmp = [...linksTmp, ...originData.tracingTos];
  }
  if (originData.subTracingTos) {
    linksTmp = [...linksTmp, ...originData.subTracingTos];
  }
  if (originData.createOns) {
    linksTmp = [...linksTmp, ...originData.createOns];
  }
  topoData.links = linksTmp;

  if (isNeedFixField) {
    fixTopoData(originData, topoData);
  }
  return topoData;
};

const setUniformLayout = (nodes, viewportSize) => {
  let viewportW = viewportSize.w;
  let viewportH = viewportSize.h;
  let viewportR = Math.min(viewportW / 2, viewportH / 2);
  let nodeNum = nodes.length;
  let nodePositions = [];
  for (let i = 0; i < nodeNum; i++) {
    let k = Math.sqrt(Math.random()) * viewportR;
    let theta = Math.random() * 2 * Math.PI;
    let x = k * Math.cos(theta) + viewportW / 2;
    let y = k * Math.sin(theta) + viewportH / 2;
    nodePositions.push([x, y]);
  }
  for (let i = 0; i < nodeNum; i++) {
    nodes[i].x = nodePositions[i][0];
    nodes[i].y = nodePositions[i][1];
    // @todo: 是否同类
    // @todo: 是否连接
  }
};

export { dateFormat, utc2Peking, formatTopoData, setUniformLayout };
