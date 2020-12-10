import { SHORT_NAME_LENGTH } from '@/constants/topo';

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
    });
    topoData.links.forEach((link) => {
      link.type = link.label;
      link.sid = link.source;
      link.tid = link.target;
    });
  }

  return topoData;
};

export { dateFormat, formatTopoData };
