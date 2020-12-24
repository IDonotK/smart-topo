import { SHORT_NAME_LENGTH, LINK_QPS_LEVELS } from '@/constants/topo';

const dateFormat = (fmt: string, date: Date) => {
  let ret: any;
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
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
    }
  }
  return fmt;
};

/**
 * utc时间转北京时间
 * @param utc_datetime 2020-12-11T12:15:27.000+00:00
 * @return peking_datetime 2017-03-31 16:02:06
 */
const utc2Peking = (utc_datetime) => {
  var T_pos = utc_datetime.indexOf('T');
  var T_pos = utc_datetime.indexOf('T');
  var Z_pos = utc_datetime.indexOf('+');
  var year_month_day = utc_datetime.substr(0, T_pos);
  var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
  var new_datetime = year_month_day + ' ' + hour_minute_second;

  // 处理成为时间戳
  timestamp = new Date(Date.parse(new_datetime));
  timestamp = timestamp.getTime();
  timestamp = timestamp / 1000;

  // 增加8个小时，北京时间比utc时间多八个时区
  var timestamp = timestamp + 8 * 60 * 60;

  // 时间戳转为时间
  var peking_datetime = dateFormat('YYYY-mm-dd HH:MM:SS', new Date(parseInt(timestamp) * 1000));
  return peking_datetime + ' +08:00';
};

const getLinkQpsLevel = (link) => {
  if (link.label !== 'TracingTo' && link.label !== 'SubTracingTo') {
    return 1;
  }
  let levelTmp = LINK_QPS_LEVELS.find((level) => {
    return link.callPerMinute >= level.min && link.callPerMinute < level.max;
  });
  let qpsLevel = levelTmp === undefined ? 1 : Number(levelTmp.id) * 0.8;
  return qpsLevel;
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
    topoData.nodes.forEach((node) => {
      if (node.name.length > SHORT_NAME_LENGTH) {
        node.shortName = node.name.substring(0, SHORT_NAME_LENGTH) + '...';
      } else {
        node.shortName = node.name;
      }
      node.type = node.label;
      node.state = node.eventCount > 0 ? 'Abnormal' : 'Normal';
      // utc时间转北京时间
      node.createTime = utc2Peking(node.createTime);
      node.updateTime = utc2Peking(node.updateTime);
    });
    topoData.links.forEach((link) => {
      link.type = link.label;
      link.sid = link.source;
      link.tid = link.target;
      link.qpsLevel = getLinkQpsLevel(link);
    });
  }
  return topoData;
};

export { dateFormat, utc2Peking, formatTopoData };
