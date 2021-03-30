import axios from 'axios';
import { formatTopoData } from '@/utils/topo';
import { getA1Up, getA1Down, getA1Both, getM1Up, getM1Down } from '@/store/modules/topology/relative-data';

let CancelToken = axios.CancelToken;
let pending = [];

function clearPending() {
  while (pending.length) {
    pending.pop()();
  }
}

function getEventLevel(relativeData) {
  let eventLevel = '';
  let elevelSet = new Set();
  if (relativeData && relativeData.nodes) {
    relativeData.nodes.forEach(item => {
      elevelSet.add(item.eventLevel);
    });
  }
  if (elevelSet.has('Critical')) {
    eventLevel = 'Critical';
  } else if (elevelSet.has('Warning')) {
    eventLevel = 'Warning';
  }
  return eventLevel;
}

function queryRelativeData(params) {
  return axios
    .get(`${self.location.origin}/v1/linked-endpoints`, {
      params,
      cancelToken: new CancelToken(c => {
        pending.push(c);
      }),
    })
    .then(res => {
      // let relativeData = formatTopoData(res, false);
      let relativeData = {
        nodes: [],
        links: [],
      };
      if (params.direction === 'in') {
        if (params.id === 'm1') {
          relativeData = formatTopoData(getM1Up(), true);
        } else {
          relativeData = formatTopoData(getA1Up(), true);
        }
      } else if (params.direction === 'out') {
        if (params.id === 'm1') {
          relativeData = formatTopoData(getM1Down(), true);
        } else {
          relativeData = formatTopoData(getA1Down(), true);
        }
      } else {
        relativeData = formatTopoData(getA1Both(), true);
      }
      return relativeData;
    })
    .catch(err => {});
}

async function exploreRelativeData(options, cb) {
  if (!options) {
    if (cb) {
      cb();
    }
    return;
  }
  let nodes = options.data;
  let args = options.args;
  for (let node of nodes) {
    let relativeData = await queryRelativeData({
      id: node.id,
      model_type: node.type,
      direction: args.direction,
      start_time: args.start_time,
      end_time: args.end_time,
    });
    let eventLevel = getEventLevel(relativeData);
    postMessage({
      cmd: 'update',
      options: {
        data: {
          id: node.id,
          eventLevel,
        }
      },
    })
  }
  if (cb) {
    cb();
  }
}

onmessage = function(e) {
  if (e.data && e.data.cmd) {
    switch (e.data.cmd) {
      case 'start':
        exploreRelativeData(e.data.options, () => {
          postMessage({
            cmd: 'end',
          });
        });
        break;
      case 'cancel': clearPending(); break; 
      default:
        break;
    }
  }
};
