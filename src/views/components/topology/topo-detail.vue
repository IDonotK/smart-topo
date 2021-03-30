<template>
  <div id="tdId" ref="tdDom" class="topo-detail">
    <!-- 背景调色 -->
    <div
      v-for="(item, index) in navList"
      :key="index"
      :class="{
        'td-item': true,
        'tdi-odd': index % 2 !== 0,
        'tdi-even': index % 2 === 0,
        'tdi-select': item.id === currentNode.type,
      }"
    >
      <div class="tdi-c"></div>
    </div>
    <div id="tdtId" ref="tdTopo" class="td-topo">
      <!-- 节点纵向依赖 -->
      <div id="tdt-view-cross-layer">
        <!-- link text -->
        <div v-show="linkTextVisible" class="linkText" :style="linkTextStyle" v-html="linkTextContent"></div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import tool from './utils/tool';

export default {
  props: {
    topoViewData: {
      type: Object,
      default() {
        return {
          nodes: [],
          links: [],
        };
      },
    },
    foldTopoDetail: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      navList: [],
      linkTextStyle: {
        left: 0,
        top: 0,
      },
      linkTextVisible: false,
      linkTextContent: '',
      nodeSingleClickTimer: null,
      usedTool: null,
      nodeDetailItems: [
        'id',
        'name',
        'label',
        'state',
        'eventCount',
        'eventLevel',
        'createTime',
        'updateTime',
        'podIp',
        'nodeIp',
        'hostName',
        'processNo',
        'middleWareType',
        'kind',
      ],
      tickTimer: null,
    }
  },

  computed: {
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    topoDetailData() {
      return this.$store.state.rocketTopo.topoDetailData;
    },
    currentNode() {
      return this.$store.state.rocketTopo.currentNode;
    },
  },

  watch: {
    foldTopoDetail(newVal) {
      if (!newVal) {
        this.drawDetailTopoCrossLayer();
      }
    },
    topoDetailData(newVal) {
      this.drawDetailTopoCrossLayer();
    }
  },

  mounted() {
    this.initNavList();
    this.drawDetailTopoCrossLayer();
    window.addEventListener('resize', this.resize);
  },

  destroyed() {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
  },

  methods: {
    initNavList() {
      this.navList = [
        {
          id: 'Application',
          name: 'Application',
        },
        {
          id: 'MiddleWare',
          name: 'MiddleWare',
        },
        {
          id: 'Process',
          name: 'Process',
        },
        {
          id: 'Pod',
          name: 'Pod',
        },
        {
          id: 'Node',
          name: 'Node',
        }
      ];
    },
    setCurNodeStably(curNode) {
      let lastX = curNode.x;
      let lastY = curNode.y;
      let staticNum = 0;
      this.tickTimer = setInterval(() => {
        if (parseInt(curNode.x) === parseInt(lastX) && parseInt(curNode.y) === parseInt(lastY)) { // 可放宽限制，加快速度
          staticNum++;
        } else {
          lastX = curNode.x;
          lastY = curNode.y;
          staticNum = 0;
        }
        if (staticNum > 10) {
          clearTimeout(this.tickTimer);
          this.tickTimer = null;
          this.$store.commit('rocketTopo/SET_NODE', curNode);
        }
      }, 10);
    },
    setVerticalLinkOffset(sortMap, nodesOption) {
      const startFixX = 45;
      const deltaFixX = 45;
      let startFixTopoWidthMax = 0;
      let endFixTopoWidthMax = 0;
      for (let sortVal of sortMap.values()) {
        // 1. 排序：长度由小到大
        sortVal.sort((a, b) => {
          let sNodeA = nodesOption.find(node => node.id === a.sid);
          let tNodeA = nodesOption.find(node => node.id === a.tid);
          let sNodeB = nodesOption.find(node => node.id === b.sid);
          let tNodeB = nodesOption.find(node => node.id === b.tid);
          return (tNodeA.y - sNodeA.y) - (tNodeB.y - sNodeB.y);
        });
        let lCount = 0;
        let rCount = 0;
        // 2. 奇左偶右
        let startFixTopoWidthTmp = 0;
        let endFixTopoWidthTmp = 0;
        sortVal.forEach((link, index) => {
          if (index % 2 === 0) {
            link.fixX = -(startFixX + lCount * deltaFixX);
            //@todo: 只找头
            startFixTopoWidthTmp = -link.fixX;
            lCount++;
          } else {
            link.fixX = startFixX + rCount * deltaFixX;
            //@todo: 只找尾
            endFixTopoWidthTmp = link.fixX;
            rCount++;
          }
        });
        if (startFixTopoWidthTmp > startFixTopoWidthMax) {
          startFixTopoWidthMax = startFixTopoWidthTmp;
        }
        if (endFixTopoWidthTmp > endFixTopoWidthMax) {
          endFixTopoWidthMax = endFixTopoWidthTmp;
        }
      }
      return { startFixTopoWidthMax, endFixTopoWidthMax };
    },
    sortVerticalLinks({ xSet, deltah, existingTypes }, nodesOption, linksOption) {
      let sortMap = new Map();
      for (let xVal of xSet) {
        sortMap.set(xVal, []);
      }
      let verticalLinks = linksOption.filter(link => link.isVertical);
      let typesOption = ['Application', 'MiddleWare', 'Process', 'Pod', 'Node'];
      verticalLinks.forEach(link => {
        let sNode = nodesOption.find(node => node.id === link.sid);
        let tNode = nodesOption.find(node => node.id === link.tid);
        // 两个点只有一条边，只需要处理 跨层&&中间有其它类型且同横坐标点 的边
        if ((tNode.y - sNode.y + 2) > (2 * deltah)) { // 满足跨层
          let stIndex = typesOption.indexOf(sNode.type);
          let ttIndex = typesOption.indexOf(tNode.type);
          let middleTypes = [];
          let hasMidTypes = false;
          if (stIndex > -1 && ttIndex > -1 && stIndex < ttIndex) {
            middleTypes = typesOption.slice(stIndex + 1, ttIndex);
          }
          for (let i = 0; i < middleTypes.length; i++) {
            let curType = middleTypes[i];
            if (existingTypes.has(curType)) {
              let midNode = nodesOption.find(node => node.type === curType && node.x === sNode.x);
              if (midNode && midNode.id !== undefined) {
                hasMidTypes = true;
                break;
              }
            }
          }
          if (hasMidTypes) { // 满足中间有其它类型且同横坐标点
            sortMap.get(sNode.x).push(link);
          }
        }
      });
      return sortMap;
    },
    markVerticalLinks(nodesOption, linksOption) {
      let xSet = new Set();
      linksOption.forEach(link => {
        let sNode = nodesOption.find(node => node.id === link.sid);
        let tNode = nodesOption.find(node => node.id === link.tid);
        if (sNode && tNode && sNode.x === tNode.x) {
          link.isVertical = true;
          xSet.add(sNode.x);
        } else {
          link.isVertical = false;
        }
        if (sNode && tNode && Math.abs(sNode.y - tNode.y) <= 4) {
          link.isHorizontal = true;
        } else {
          link.isHorizontal = false;
        }
      });
      return xSet;
    },
    handleVerticalLinks({ existingTypes, deltah }, nodesOption, linksOption) {
      // 1.标记垂直边
      let xSet = this.markVerticalLinks(nodesOption, linksOption);

      // 2.垂直边分组
      let sortMap = this.sortVerticalLinks({ xSet, deltah, existingTypes }, nodesOption, linksOption);

      // 3.设置边偏移
      let { startFixTopoWidthMax, endFixTopoWidthMax } = this.setVerticalLinkOffset(sortMap, nodesOption);

      // 4.校正节点坐标
      nodesOption.forEach(node => {
        node.x += startFixTopoWidthMax;
        node.fx = node.x;
      });

      return { startFixTopoWidthMax, endFixTopoWidthMax };
    },
    setOtherOption(linksOption, anchorsOption, arrowsOption) {
      linksOption.forEach(link => {
        if (link.type === 'TracingTo' || link.type === 'SubTracingTo') {
          anchorsOption.push(link);
        }
        arrowsOption.push(link);
      });
    },
    setLinksOption(graph, linksOption) {
      graph.links.forEach(link => {
        let itemTmp = {
          id: link.id,
          sid: link.sid,
          tid: link.tid,
          source: link.sid,
          target: link.tid,
          type: link.type,
          isTracingTo: !!((link.type === 'TracingTo' || link.type === 'SubTracingTo')),
          callPerMinute: link.callPerMinute,
          responseTimePerMin: link.responseTimePerMin,
          isVertical: false,
          isHorizontal: false,
          fixX: 0,
          qpsLevel: link.qpsLevel,
        };
        linksOption.push(itemTmp);
      });
    },
    setNodesOption({ graph, deltah, deltaw }, nodesOption, { curTypeNum }, pointStartX) {
      let { appStartX, middlewareStartX, processStartX, podStartX, nodeStartX } = pointStartX;
      let [ appNum, middlewareNum, processNum, podNum, nodeNum ] = [0, 0, 0, 0, 0];
      let existingTypes = new Set();
      let nodePosOption = {};
      graph.nodes.forEach(node => {
        let itemTmp = {};
        Object.keys(node).forEach(key => {
          if (this.nodeDetailItems.includes(key)) {
            itemTmp[key] = node[key];
          }
        });
        existingTypes.add(node.type);
        itemTmp.type = node.type;
        itemTmp.shortName = node.shortName;
        switch (node.type) {
          case 'Application':
            appNum++;
            nodePosOption = { nType: 'Application', nNum: appNum, cNum: curTypeNum, nObj: itemTmp, startX: appStartX, factorY: 0.5, nSize: 28, deltaw, deltah };
            break;
          case 'MiddleWare':
            middlewareNum++;
            nodePosOption = { nType: 'MiddleWare', nNum: middlewareNum, cNum: curTypeNum, nObj: itemTmp, startX: middlewareStartX, factorY: 1.5, nSize: 28, deltaw, deltah };
            break;
          case 'Process':
            processNum++;
            nodePosOption = { nType: 'Process', nNum: processNum, cNum: curTypeNum, nObj: itemTmp, startX: processStartX, factorY: 2.5, nSize: 28, deltaw, deltah };
            break;
          case 'Pod':
            podNum++;
            nodePosOption = { nType: 'Pod', nNum: podNum, cNum: curTypeNum, nObj: itemTmp, startX: podStartX, factorY: 3.5, nSize: 28, deltaw, deltah };
            break;
          case 'Node':
            nodeNum++;
            nodePosOption = { nType: 'Node', nNum: nodeNum, cNum: curTypeNum, nObj: itemTmp, startX: nodeStartX, factorY: 4.5, nSize: 28, deltaw, deltah };
            break;
          default: break;
        }
        this.setNodePositon(nodePosOption);
        nodesOption.push(itemTmp);
      });
      return existingTypes;
    },
    countPointsNum(graph) {
      let appNum = 0;
      let middlewareNum = 0;
      let processNum = 0;
      let podNum = 0;
      let nodeNum = 0;
      let curTypeNum = 0;
      graph.nodes.forEach(node => {
        switch (node.type) {
          case 'Application': appNum++; break;
          case 'MiddleWare': middlewareNum++; break;
          case 'Process': processNum++; break;
          case 'Pod': podNum++; break;
          case 'Node': nodeNum++; break;
          default: break;
        }
      });
      switch (this.currentNode.type) {
        case 'Application': appNum = (appNum % 2 === 0 ? appNum + 1 : appNum); curTypeNum = appNum; break;
        case 'MiddleWare': middlewareNum = (middlewareNum % 2 === 0 ? middlewareNum + 1 : middlewareNum); curTypeNum = middlewareNum; break;
        case 'Process': processNum = (processNum % 2 === 0 ? processNum + 1 : processNum); curTypeNum = processNum; break;
        case 'Pod': podNum = (podNum % 2 === 0 ? podNum + 1 : podNum); curTypeNum = podNum; break;
        case 'Node': nodeNum = (nodeNum % 2 === 0 ? nodeNum + 1 : nodeNum); curTypeNum = nodeNum; break;
        default: break;
      }
      let maxNum = Math.max(appNum, middlewareNum, processNum, podNum, nodeNum);
      return { appNum, middlewareNum, processNum, podNum, nodeNum, curTypeNum, maxNum };
    },
    getPointStartX(pointsNum) {
      let { appNum, middlewareNum, processNum, podNum, nodeNum, curTypeNum, maxNum } = pointsNum;
      let appStartX = 45 + (maxNum - appNum) / 2 * 50;
      let middlewareStartX = 45 + (maxNum - middlewareNum) / 2 * 50;
      let processStartX = 45 + (maxNum - processNum) / 2 * 50;
      let podStartX = 45 + (maxNum - podNum) / 2 * 50;
      let nodeStartX = 45 + (maxNum - nodeNum) / 2 * 50;
      return { appStartX, middlewareStartX, processStartX, podStartX, nodeStartX };
    },
    clearTopo() {
      this.$d3.select('#tdt-view-cross-layer svg').remove();
      this.clearInfoTips();
    },
    clearInfoTips() {
      if (this.tip) {
        this.tip.hide(this);
        this.tip = null;
      }
      if (this.usedTool) {
        this.usedTool.attr('style', 'display: none');
        this.usedTool = null;
      }
      this.linkTextVisible = false;
      this.linkTextContent = '';
      this.linkTextStyle = {
        height: `${0  }px`,
        left: `${0  }px`,
        top: `${0  }px`,
      };
    },
    getNodeIcon(node, isBright) {
      let type = '';
      switch (node.type) {
        case 'MiddleWare':
          {
            let middleWareTypes = ['MQ', 'Database', 'Cache'];
            type = middleWareTypes.includes(node.middleWareType) ? `_${  node.middleWareType}` : '';
          }
          break;
        default:
          break;
      }
      return `#${node.type}${type}${isBright ? '_bright' : ''}`.toUpperCase();
    },
    getEventIcon(node) {
      let icon = '';
      if (node && node.eventCount > 0) {
         switch (node.eventLevel) {
            case 'Critical': icon = '#EVENT_CRITICAL'; break;
            case 'Warning': icon = '#EVENT_WARNING'; break;
            default: break;
          }
      }
      return icon;
    },
    setNodePositon({ nType, nNum, cNum, nObj, startX, factorY, nSize, deltaw, deltah }) {
      if (this.currentNode.type === nType) {
        this.setNodePositonCurNodeLayer({ nNum, cNum, nObj, startX, factorY, nSize, deltaw, deltah });
      } else {
        this.setNodePositonNormalLayer({ nNum, nObj, startX, factorY, nSize, deltaw, deltah });
      }
    },
    setNodePositonNormalLayer({ nNum, nObj, startX, factorY, nSize, deltaw, deltah }) {
      nObj.x = startX + (nNum - 1) * deltaw;
      nObj.y = factorY * deltah - nSize / 2;
      nObj.fx = nObj.x;
      nObj.fy = nObj.y;
      nObj.symbolSize = nSize;
    },
    setNodePositonCurNodeLayer({ nNum, cNum, nObj, startX, factorY, nSize, deltaw, deltah }) {
      if (nNum === 1) { // 选中节点居中
        this.setNodePositonNormalLayer({ nNum: (cNum + 1) / 2, nObj, startX, factorY, nSize, deltaw, deltah });
      } else if (nNum > 1 && nNum <= (cNum + 1) / 2) {
        this.setNodePositonNormalLayer({ nNum: nNum - 1, nObj, startX, factorY, nSize: nSize - 8, deltaw, deltah });
      } else if (nNum > (cNum + 1) / 2) {
        this.setNodePositonNormalLayer({ nNum, nObj, startX, factorY, nSize: nSize - 8, deltaw, deltah });
      }
    },
    drawDetailTopoCrossLayer() {
      this.clearTopo();
      if (this.topoDetailData.nodes.length <= 0) {
        return;
      }
      const graph = this.topoDetailData;
      this.topoHeight = this.$jq('#tdtId').height();
      const deltah = this.topoHeight / 5;
      const deltaw = 50;

      let pointsNum = this.countPointsNum(graph);
      let pointStartX = this.getPointStartX(pointsNum);
      let { maxNum } = pointsNum;

      const [ nodesOption, linksOption, anchorsOption, arrowsOption] = [[], [], [], []];
      let existingTypes = this.setNodesOption({ graph, deltah, deltaw }, nodesOption, pointsNum, pointStartX);
      this.setLinksOption(graph, linksOption);
      this.setOtherOption(linksOption, anchorsOption, arrowsOption);
      let { startFixTopoWidthMax, endFixTopoWidthMax } = this.handleVerticalLinks({ existingTypes, deltah }, nodesOption, linksOption);

      const tdwWidthMax = document.getElementById('tvccId').clientWidth * 0.6;
      this.topoWidth = startFixTopoWidthMax + 45 + maxNum * deltaw + 30 + endFixTopoWidthMax;
      let tdwWidth = this.topoWidth > tdwWidthMax ? tdwWidthMax : this.topoWidth;
      this.$jq('#tdwId').width(tdwWidth);
      this.$jq('#tdId').width(this.topoWidth);
      this.drawTopo(nodesOption, linksOption, arrowsOption, anchorsOption);
    },
    drawTopo(nodesOption, linksOption, arrowsOption, anchorsOption) {
      const svg = this.$d3
        .select('#tdt-view-cross-layer')
        .append('svg')
        .attr('class', 'topo-svg')
        .attr('height', this.topoHeight);
      this.tip = this.$d3tip()
        .attr('class', 'd3-tip');
      svg.call(this.tip);
      const force = this.$d3
        .forceSimulation(nodesOption)
        .force('link', this.$d3.forceLink(linksOption).id(d => d.id))
        .on('tick', () => { this.simulationTick(nodeEles, linkEles, anchorEles); });
      let nodeEles = svg.append('g').attr('class', 'topo-nodes').selectAll('.topo-node');
      let linkEles = svg.append('g').attr('class', 'topo-lines').selectAll('.topo-line');
      let anchorEles = svg.append('g').attr('class', 'topo-line-anchors').selectAll('.topo-line-anchor');
      let arrowEles = svg.append('defs').attr('class', 'topo-line-arrows').selectAll('.topo-line-arrow');
      this.setUseTool(svg);
      nodeEles = this.getNodeEles(nodeEles, nodesOption);
      arrowEles = this.getArrowEles(arrowEles, arrowsOption);
      linkEles = this.getLinkEles(linkEles, linksOption);
      anchorEles= this.getAnchorEles(anchorEles, anchorsOption);
      svg.on('click', (d, i) => { this.handleSvgClicked(d, i); });
    },
    setUseTool(svg) {
      let shapeOption = {
        side: 3,
        centerRadius: 15,
        hexagonRadius: 10,
        fixAngle: Math.PI / 6,
        iconSize: 12,
      };
      this.usedTool = tool(svg, [
        {icon: 'NODEDETAIL', click: this.handleGoNodeDetail},
        {icon: ''},
        {icon: ''},
      ], shapeOption);
    },
    getNodeEles(nodeEles, nodesOption) {
      let nodeElesTmp = nodeEles.data(nodesOption)
        .enter().append('g')
        .attr('class', 'topo-node');
      nodeElesTmp.append('svg')
        .attr('width', d => d.symbolSize)
        .attr('height', d => d.symbolSize)
        .attr('x', d => -d.symbolSize / 2)
        .attr('y', d => 0)
        .append('use')
        .attr('xlink:href', d => this.getNodeIcon(d, false));
      nodeElesTmp.append('svg')
        .attr('class', 'event-node-cross-topo')
        .attr('width', d => d.symbolSize === 28 ? 15 : 12)
        .attr('height', d => d.symbolSize === 28 ? 15 : 12)
        .attr('x', d => d.symbolSize === 28 ? 6 : 4)
        .attr('y', d => d.symbolSize === 28 ? -12 : -7)
        .append('use')
        .attr('xlink:href', d => this.getEventIcon(d));
      nodeElesTmp.append('circle')
        .attr('r', d => d.symbolSize / 2)
        .attr('x', d => d.x)
        .attr('y', d => d.y - d.symbolSize / 2)
        .attr('cy', d => d.symbolSize / 2)
        .attr('style', 'cursor: pointer; opacity: 0;')
        .on('mouseenter', (data, index, element) => { this.handleNodeMouseenter(data, index, element); })
        .on('mouseleave', d => { this.handleNodeMouseleave(d); })
        .on('click', d => { this.handleNodeClicked(d); })
        .on('dblclick', d => { this.handleNodeDblclicked(d); });
      return nodeElesTmp;
    },
    getArrowEles(arrowEles, arrowsOption) {
      return arrowEles.data(arrowsOption, (d) => d.id)
        .enter().append('marker')
        .attr('id', d => `arrow_detail${d.id}`)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', d => 0.6 * (d.source.symbolSize > d.target.symbolSize ? d.source.symbolSize : d.target.symbolSize))
        .attr('markerHeight', d => 0.6 * (d.source.symbolSize > d.target.symbolSize ? d.source.symbolSize : d.target.symbolSize))
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 8)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('path')
        .attr('class', 'topo-line-arrow')
        .attr('d', 'M0,0 L8,3 L0,6 L3,3 L0,0')
        // .attr('fill', '#217EF25f');
    },
    getLinkEles(linkEles, linksOption) {
      return linkEles.data(linksOption)
        .enter().append('path')
        .attr('class', 'topo-line')
        .attr('stroke-width', d => d.qpsLevel * 1.3)
        .attr('stroke-dasharray', d => d.isTracingTo ? '7 5' : 'none')
        .attr('marker-end', d => `url(#arrow_detail${d.id})`)
        .on('mouseover', d => { this.handleLinkMouseover(d); })
        .on('mouseout', d => { this.handleLinkMouseout(d); })
        .style('stroke', '#217EF25f');
    },
    handleAnchorMouseout(data) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$jq('.topo-line').removeClass('tl-static');
      this.$jq(this.$d3.event.target).removeClass('topo-line-anchor-light');
      this.$jq(this.$jq('.topo-line')[data.index]).removeClass('topo-line-light');
      let sNode = this.$jq('.topo-node')[data.source.index];
      let tNode = this.$jq('.topo-node')[data.target.index];
      this.$jq(sNode)
        .children('svg:first')
        .children('use')
        .attr('href', this.getNodeIcon(data.source, false));
      this.$jq(tNode)
        .children('svg:first')
        .children('use')
        .attr('href', this.getNodeIcon(data.target, false));
      this.$jq(`#arrow_detail${data.id} path`).removeClass('topo-line-arrow-light');

      this.tip.direction('n');
      this.tip.hide(this);
    },
    handleAnchorMouseover(data, index, element) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$jq('.topo-line').addClass('tl-static');
      this.$jq(this.$d3.event.target).addClass('topo-line-anchor-light');
      this.$jq(this.$jq('.topo-line')[data.index]).addClass('topo-line-light');
      let sNode = this.$jq('.topo-node')[data.source.index];
      let tNode = this.$jq('.topo-node')[data.target.index];
      this.$jq(sNode)
        .children('svg:first')
        .children('use')
        .attr('href', this.getNodeIcon(data.source, true));
      this.$jq(tNode)
        .children('svg:first')
        .children('use')
        .attr('href', this.getNodeIcon(data.target, true));
      this.$jq(`#arrow_detail${data.id} path`).addClass('topo-line-arrow-light');

      if (data.source.type === 'Application' || data.target.type === 'Application') {
        this.tip.direction('e');
      } else {
        this.tip.direction('n');
      }
      this.tip.html(tipData =>
        `
          <div class="mb-5"><span class="grey">${this.$t('topoDetail_link_type')}</span>${tipData.type}</div>
          <div class="mb-5"><span class="grey">${this.$t('topoDetail_link_callPerMinute')}</span>${tipData.callPerMinute === undefined ? ' ' : `${tipData.callPerMinute  } ${this.$t('topoDetail_link_callPerMinute_unit')}`}</div>
          <div><span class="grey">${this.$t('topoDetail_link_responseTimePerMin')}</span>${tipData.responseTimePerMin  === undefined ? ' ' : `${tipData.responseTimePerMin  } ${this.$t('topoDetail_link_responseTimePerMin_unit')}`}</div>
        `
      ).show(data, element[index]);
    },
    getAnchorEles(anchorEles, anchorsOption) {
      return anchorEles.data(anchorsOption, (d) => d.id)
        .enter().append('circle')
        .attr('class', 'topo-line-anchor')
        .attr('stroke', 'none')
        .attr('r', 5)
        .attr('fill', '#217EF25f')
        .on('mouseover', (data, index, element) => { this.handleAnchorMouseover(data, index, element); })
        .on('mouseout', (data) => { this.handleAnchorMouseout(data); });
    },
    simulationTick(nodeEles, linkEles, anchorEles) {
      nodeEles.attr('transform', d => `translate(${d.fx}, ${d.fy})`);
      linkEles.attr('d', d => {
        if (d.isVertical) {
          return `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2 + d.fixX} ${(d.source.fy + d.target.fy) / 2} ${d.target.fx} ${d.target.fy}`;
        } else if (d.isHorizontal) {
          return `M ${d.source.fx} ${d.source.fy}
            Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 - 45}
            ${d.target.fx} ${d.target.fy}
          `;
        } else {
          return `
            M ${ d.source.fx } ${ d.source.fy }
            C ${ d.source.fx } ${ d.source.fy + (d.target.fy - d.source.fy) * 0.8 }
            ${ d.target.fx } ${ d.target.fy - (d.target.fy - d.source.fy) * 0.8 }
            ${ d.target.fx } ${ d.target.fy }
          `;
        }
      });
      anchorEles.attr('transform', d => {
        if (d.isHorizontal) {
          return `translate(${(d.source.x + d.target.x) / 2}, ${(d.target.y + d.source.y) / 2 - 22.5})`;
        } else {
          return `translate(${(d.source.x + d.target.x) / 2}, ${(d.target.y + d.source.y) / 2})`;
        }
      });
    },
    handleLinkMouseout(d) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      if (!d.isTracingTo) {
        this.linkTextVisible = false;
        this.linkTextContent = '';
        this.linkTextStyle = {
          height: `${0  }px`,
          left: `${0  }px`,
          top: `${0  }px`,
        };
        this.$jq(this.$d3.event.target).removeClass('topo-line-light');
        let sNode = this.$jq('.topo-node')[d.source.index];
        let tNode = this.$jq('.topo-node')[d.target.index];
        this.$jq(sNode)
          .children('svg:first')
          .children('use')
          .attr('href', this.getNodeIcon(d.source, false));
        this.$jq(tNode)
          .children('svg:first')
          .children('use')
          .attr('href', this.getNodeIcon(d.target, false));
        this.$jq(`#arrow_detail${d.id} path`).removeClass('topo-line-arrow-light');
      }
    },
    handleLinkMouseover(d) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      if (!d.isTracingTo) {
        let offsetX = this.$jq('#tdt-view-cross-layer').offset().left;
        let offsetY = this.$jq('#tdt-view-cross-layer').offset().top;
        this.linkTextStyle = {
          height: `${25  }px`,
          left: `${this.$d3.event.clientX - offsetX + 10  }px`,
          top: `${this.$d3.event.clientY - offsetY - 25  }px`,
        };
        this.linkTextContent = d.type;
        this.linkTextVisible = true;
        this.$jq(this.$d3.event.target).addClass('topo-line-light');
        let sNode = this.$jq('.topo-node')[d.source.index];
        let tNode = this.$jq('.topo-node')[d.target.index];
        this.$jq(sNode)
          .children('svg:first')
          .children('use')
          .attr('href', this.getNodeIcon(d.source, true));
        this.$jq(tNode)
          .children('svg:first')
          .children('use')
          .attr('href', this.getNodeIcon(d.target, true));
        this.$jq(`#arrow_detail${d.id} path`).addClass('topo-line-arrow-light');
      }
    },
    handleNodeDblclicked(nodeTmp) {
      if (this.topoMode !== 'global') {
        return;
      }
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$emit('toggleNodeDetail', false);
      this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      this.$jq('.topo-line').removeClass('tl-static');
      this.tip.hide(this);
      this.usedTool.attr('style', 'display: none');
      if (nodeTmp.id === this.currentNode.id) {
        return;
      }
      let node = this.topoViewData.nodes.find(item => item.id === nodeTmp.id); // 对应主拓扑的节点对象
      this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
      this.setCurNodeStably(node);
    },
    handleNodeClicked(d) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$emit('toggleNodeDetail', false);
      this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      this.$store.commit('rocketTopo/SET_VIEW_NODE', d);
      if (this.nodeSingleClickTimer !== null) {
        clearTimeout(this.nodeSingleClickTimer);
        this.nodeSingleClickTimer = null;
        return;
      }
      this.nodeSingleClickTimer = setTimeout(() => {
        this.nodeSingleClickTimer = null;
        this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', d);
        this.usedTool
          .attr('transform', `translate(${d.x}, ${d.y})`)
          .attr('style', 'display: block');
      }, 300);
    },
    handleNodeMouseleave(d) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$jq('.topo-line').removeClass('tl-static');
      this.tip.hide(this);
    },
    handleNodeMouseenter(data, index, element) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      // 处理点边重叠的情况
      this.$jq('.topo-line').addClass('tl-static');
      this.tip.html((tipData) => `<div>${tipData.shortName}</div>`).show(data, element[index]);
    },
    handleSvgClicked(d, i) {
      this.$d3.event.stopPropagation();
      this.$d3.event.preventDefault();
      this.$emit('toggleNodeDetail', false);
      this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      this.usedTool.attr('style', 'display: none');
    },
    handleGoNodeDetail() {
      event.stopPropagation();
      event.preventDefault();
      this.usedTool.attr('style', 'display: none');
      this.$emit('toggleNodeDetail', true);
    },
    resize() {
      if (!this.foldTopoDetail) {
        this.drawDetailTopoCrossLayer();
      }
    },
  }
}
</script>

<style lang="scss">
.d3-tip {
    pointer-events: none !important;
    z-index: 9999;
    max-width: 500px;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-all;
}

.topo-detail {
    height: 100%;
    -webkit-transition: all 0.5s;
    transition: all 0.5s;
    position: relative;

    .td-item {
        width: 100%;
        height: 20%;
        cursor: pointer;

        &.tdi-odd {
            background-color: #252a2f;
        }

        &.tdi-even {
            background-color: #242424;
        }

        &.tdi-select {
            background-color: #333840 !important;
        }
    }

    .td-topo {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;

        #tdt-view-cross-layer {
            width: 100%;
            height: 100%;
            position: relative;

            .linkText {
                position: absolute;
                z-index: 999;
                background-color: #242424;
                border-radius: 2px;
                color: white;
                padding: 2px;
                text-align: left;
                white-space: nowrap;
                pointer-events: none !important;
            }

            .topo-svg {
                display: block;
                width: 100%;

                .topo-line {
                    // stroke-linecap: round;
                    fill: none;
                    // animation: topo-dash 0.8s linear infinite !important;

                    &.topo-line-light {
                        stroke: yellow !important;
                    }
                }

                @keyframes topo-dash {
                    from {
                        stroke-dashoffset: 12;
                    }

                    to {
                        stroke-dashoffset: 0;
                    }
                }

                .topo-line-anchor {
                    cursor: pointer;

                    &.topo-line-anchor-light {
                        fill: yellow !important;
                    }
                }

                .topo-line-arrow {
                    fill: #217ef25f;

                    &.topo-line-arrow-light {
                        fill: yellow !important;
                    }
                }

                .tl-static {
                    pointer-events: none;
                }

                .topo-tool {
                    display: none;

                    g:nth-child(2),
                    g:nth-child(3) {
                        display: none;
                    }
                }

                .topo-tool-i {
                    cursor: pointer;

                    .tool-hexagon {
                        fill: #3f4450;
                        stroke: #217ef2;
                        stroke-width: 2;
                        stroke-opacity: 0.5;
                    }

                    &:hover {
                        .tool-hexagon {
                            stroke-opacity: 1;
                        }
                    }
                }
            }
        }
    }
}
</style>
