<script>
import SvgRenderer from './components/svg-renderer.vue';

export default {
  name: 'LayeredNetwork',
  components: {
    SvgRenderer,
  },
  props: {
    netData: {
      type: Object,
      default: () => ({
        nodes: [],
        links: [],
      }),
    },
    currentNode: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      size: { w: 500, h: 500 },
      offset: { x: 0, y: 0 },
      nodes: [],
      links: [],
      nodeSize: 30,
      fontSize: 20,
      linkWidth: 1,
      nodeLabels: false,
      linkLabels: false,
      linkTextStyle: { height: 0, left: 0, top: 0 },
      isLinkTextDark: false,
      linkTextVisible: false,
      linkTextContent: '',
      idNamespace: 'MainTopo',
      simulation: null,
      zoomController: this.$d3.zoom(),
      topoScaleFix: 1,
      elemsAroundPreHovNodeShallow: { nodes: [], links: [] },
      elemsAroundPreHovLinkShallow: { nodes: [], links: [] },
      isVisited: [],
      layerOptions: { deltaCenter: {x: 0, y: 0}, layerLines: [] },
      nodeSingleClicked: true,
    };
  },
  computed: {
    layeredExploreNode() {
      return this.$store.state.rocketTopo.layeredExploreNode;
    },
    labelOffset() {
      return {
        x: this.nodeSize / 2,
        y: this.fontSize,
      };
    },
    center() {
      return {
        x: this.size.w / 2 + this.offset.x,
        y: this.size.h / 2 + this.offset.y,
      };
    },
  },
  watch: {
    netData(newVal, oldVal) {
      this.drawTopo();
    },
  },
  mounted() {
    this.$nextTick(() => {
      switch (this.idNamespace) {
        case 'MainTopo':
          this.$store.commit('rocketTopo/SET_NETWORK_INSTANCE_MAIN_TOPO', this);
          break;
        case 'RelativeTopo':
          this.$store.commit('rocketTopo/SET_NETWORK_INSTANCE_RELATIVE_TOPO', this);
          break;
        default:
          this.$store.commit('rocketTopo/SET_NETWORK_INSTANCE_MAIN_TOPO', this);
          break;
      }
      // this.setZoom();
      this.drawTopo();
    });
  },
  methods: {
    drawTopo() {
      this.buildNodes(this.netData.nodes);
      this.buildLinks(this.netData.links);
      let {layeredData, deltaH, deltaW, centerLineY, nodeNumMax, layers} = this.calculateLayout(this.nodes, this.links);
      this.setNodesPosition({layeredData, deltaH, deltaW, centerLineY, nodeNumMax});
      let { xMin, xMax } = this.handleVerticalLinks(this.nodes, this.links); // @todo 根据xMin、xMax调整拓扑缩放或重新计算坐标
      this.setLayerLinesPosition(this.size.w, layers, deltaH, this.nodes);
      this.animate();
    },
    markVerticalLinks(nodes, links) {
      let xSet = new Set();
      links.forEach(link => {
        let sNode = nodes.find(node => node.id === link.sid);
        let tNode = nodes.find(node => node.id === link.tid);
        if (sNode && tNode && sNode.x === tNode.x) {
          link.isVertical = true;
          xSet.add(sNode.x);
        } else {
          link.isVertical = false;
        }
      });
      return xSet;
    },
    sortVerticalLinks({ xSet }, nodes, links) {
      let sortMap = new Map();
      for (let xVal of xSet) {
        sortMap.set(xVal, []);
      }
      let verticalLinks = links.filter(link => link.isVertical);
      verticalLinks.forEach(link => {
        let sNode = nodes.find(node => node.id === link.sid);
        let tNode = nodes.find(node => node.id === link.tid);
        for (let i = 0; i < nodes.length; i++) {
          let node = nodes[i];
          if (node.x === sNode.x && node.y > sNode.y && node.y < tNode.y) { // 满足中间有其它同横坐标点
            sortMap.get(sNode.x).push(link);
            break;
          }
        }
      });
      return sortMap;
    },
    setVerticalLinkOffset(sortMap, nodes) {
      const startFixX = 45;
      const deltaFixX = 45;
      let xMin = 0;
      let xMax = 0;
      for (let sortKey of sortMap.keys()) {
        let sortVal = sortMap.get(sortKey);
        // 1. 排序：长度由小到大
        sortVal.sort((a, b) => {
          let sNodeA = nodes.find(node => node.id === a.sid);
          let tNodeA = nodes.find(node => node.id === a.tid);
          let sNodeB = nodes.find(node => node.id === b.sid);
          let tNodeB = nodes.find(node => node.id === b.tid);
          return (tNodeA.y - sNodeA.y) - (tNodeB.y - sNodeB.y);
        });
        let lCount = 0;
        let rCount = 0;
        // 2. 奇左偶右
        let xMinTmp = 0;
        let xMaxTmp = 0;
        sortVal.forEach((link, index) => {
          if (index % 2 === 0) {
            link.fixX = -(startFixX + lCount * deltaFixX);
            xMinTmp = sortKey - link.fixX;
            lCount++;
          } else {
            link.fixX = startFixX + rCount * deltaFixX;
            xMaxTmp = sortKey + link.fixX;
            rCount++;
          }
        });
        xMin = xMinTmp < xMin ? xMinTmp : xMin;
        xMax = xMaxTmp > xMax ? xMaxTmp : xMax;
      }
      return { xMin, xMax };
    },
    handleVerticalLinks(nodes, links) {
      // 1.标记垂直边
      let xSet = this.markVerticalLinks(nodes, links);
      
      // 2.垂直边分组
      let sortMap = this.sortVerticalLinks({ xSet }, nodes, links);

      // 3.设置边偏移
      let { xMin, xMax } = this.setVerticalLinkOffset(sortMap, nodes);

      return { xMin, xMax };
    },
    buildNodes(nodes) {
      this.nodes = nodes.map(node => {   
        this.setElementAttribute(node, 'id', '');
        this.setElementAttribute(node, 'name', '');
        this.setElementAttribute(node, 'showLabel', false);
        this.setElementAttribute(node, 'isDark', false);
        this.setElementAttribute(node, 'isBright', false);
        this.setElementAttribute(node, 'isRelatedToCurNode', false);
        if (node.type) {
          this.setNodeIcon(node);
        }
        return node;
      });
    },
    buildLinks(links) {
      this.links = links.map(link => {
        link.source = link.sid;
        link.target = link.tid;
        this.setElementAttribute(link, 'id', '');
        this.setElementAttribute(link, 'name', '');
        this.setElementAttribute(link, 'showLabel', false);
        this.setElementAttribute(link, 'isDark', false);
        this.setElementAttribute(link, 'isBright', false);
        this.setElementAttribute(link, 'isRelatedToCurNode', false);
        this.setElementAttribute(link, 'fixX', 0);
        this.$set(link, '_color', 'rgba(33, 126, 242, 0.373)');
        return link;
      });
    },
    calculateLayout(nodes, links) {
      this.enrichedData(nodes, links);
      let longLinks = this.getLongLinks(links);
      let layeredData = this.getLayeredData(this.layeredExploreNode, longLinks);

      // 计算画布高度
      let layersUp = layeredData.up.length;
      let layersDown = layeredData.down.length;
      let layers = layersUp + layersDown + 1;
      let deltaHTmp = 200;
      let heightTmp = deltaHTmp * layers;
      let viewHeight = this.$jq('#tvcrId').height() - 100;
      this.size.h = heightTmp < viewHeight ? viewHeight - 10 : heightTmp - 10; // 预留10px的滚动条宽度
      let deltaH = this.size.h / layers;
      let centerLineY = layersUp * deltaH + deltaH / 2;

      // 计算画布宽度
      let nodeNumMax = 1;
      layeredData.up.forEach(nodeArr => {
        let lenTmp = nodeArr.length;
        nodeNumMax = lenTmp > nodeNumMax ? lenTmp : nodeNumMax;
      });
      layeredData.down.forEach(nodeArr => {
        let lenTmp = nodeArr.length;
        nodeNumMax = lenTmp > nodeNumMax ? lenTmp : nodeNumMax;
      });
      let deltaWTmp = 200;
      let widthTmp = deltaWTmp * nodeNumMax;
      let viewWidth = this.$jq('#tvcrId').width();
      this.size.w = widthTmp < viewWidth ? viewWidth : widthTmp;
      let deltaW = this.size.w / nodeNumMax;

      return {layeredData, deltaH, deltaW, centerLineY, nodeNumMax, layers};
    },
    setLayerLinesPosition(width, layers, deltaH, nodes) {
      let exploreNode = this.layeredExploreNode;
      this.layerOptions.deltaCenter = {
        x: exploreNode.x - this.$jq('#tvcrId').width() / 2,
        y: exploreNode.y - this.$jq('#tvcrId').height() / 2 + 100,
      };
      this.layerOptions.layerLines = [];
      for (let i = 0; i < layers - 1; i++) {
        let linePos = {
          start: {
            x: 0,
            y: deltaH * (i + 1),
          },
          end: {
            x: width,
            y: deltaH * (i + 1),
          }
        };
        this.layerOptions.layerLines.push(linePos);
      }
    },
    searchUpdownStream(currentNode, links, direction, store, layer) {
      if (!this.isVisited.includes(currentNode)) {
        this.isVisited.push(currentNode);
      }
      let queue = [];
      links.forEach(link => {
        let isMeet = direction === 'in' ? link.tid === currentNode.id : link.sid === currentNode.id;
        let nodeType = direction === 'in' ? 'source' : 'target';
        if (isMeet && !this.isVisited.includes(link[nodeType])) {
          if (!store[layer]) {
            store[layer] = [];
          }
          store[layer].push(link[nodeType]);
          queue.unshift(link[nodeType]);
        }
      });
      while (queue.length) {
        let currentNodeTmp = queue.shift();
        if (!this.isVisited.includes(currentNodeTmp)) {
          this.searchUpdownStream(currentNodeTmp, links, direction, store, layer + 1);
        }
      }
    },
    getLayeredData(currentNode, links) {
      let layeredData = {
        up: [],
        center: currentNode || null,
        down: [],
      };
      this.isVisited = [];
      this.searchUpdownStream(currentNode, links, 'in', layeredData.up, 0);
      this.isVisited = [];
      this.searchUpdownStream(currentNode, links, 'out', layeredData.down, 0);
      return layeredData;
    },
    getPathLength(sNode, tNode, links, len) {
      let res = 0;
      if (!this.isVisited.includes(sNode)) {
        this.isVisited.push(sNode);
      }
      for (let i = 0; i < links.length; i++) {
        if (links[i].source === sNode) {
          if (links[i].target === tNode) {
            res = len + 1;
          } else {
            if (!this.isVisited.includes(links[i].target)) {
              let lenTmp = this.getPathLength(links[i].target, tNode, links, len + 1);
              res = lenTmp > res ? lenTmp : res;
            }
          }
          if (res > 1) {
            break;
          }
        }
      }
      return res;
    },
    getLongLinks(links) {
      let longLinks = [];
      links.forEach(link => {
        this.isVisited = [];
        let sNode = link.source;
        let tNode = link.target;
        if (this.getPathLength(sNode, tNode, links, 0) <= 1) {
          longLinks.push(link);
        }
      });
      return longLinks;
    },
    enrichedData(nodes, links) {
      links.forEach(link => {
        link.source = nodes.find(node => node.id === link.sid);
        link.target = nodes.find(node => node.id === link.tid);
      });
    },
    setNodesPosition({layeredData, deltaH, deltaW, centerLineY, nodeNumMax}) {
      layeredData.up.forEach((nodeArr, index1) => {
        let nodeNum = nodeArr.length;
        // @todo 优化横坐标
        // @todo 环路的箭头
        let startX = (nodeNumMax - nodeNum + 1) / 2 * deltaW;
        let coordY = centerLineY - deltaH * (index1 + 1) - this.nodeSize / 2;
        nodeArr.forEach((node, index2) => {
          node.x = startX + deltaW * index2;
          node.y = coordY;
          node.fx = node.x;
          node.fy = node.y;
        });
      });
      layeredData.down.forEach((nodeArr, index1) => {
        let nodeNum = nodeArr.length;
        let startX = (nodeNumMax - nodeNum + 1) / 2 * deltaW;
        let coordY = centerLineY + deltaH * (index1 + 1) - this.nodeSize / 2;
        nodeArr.forEach((node, index2) => {
          node.x = startX + deltaW * index2;
          node.y = coordY;
          node.fx = node.x;
          node.fy = node.y;
        });
      });
      if (layeredData.center) {
        layeredData.center.x = deltaW * nodeNumMax / 2;
        layeredData.center.y = centerLineY;
        layeredData.center.fx = layeredData.center.x;
        layeredData.center.fy = layeredData.center.y;
      }
    },
    setElementAttribute(elem, key, value) {
      if (!Object.prototype.hasOwnProperty.call(elem, key)) {
        this.$set(elem, key, value);
      }
    },
    setNodeIcon(node) {
      let iconTemp = node.type;
      switch (node.type) {
        case 'MiddleWare':
          {
            let middleWareTypes = ['MQ', 'Database', 'Cache'];
            iconTemp = middleWareTypes.includes(node.middleWareType) ? `${iconTemp}_${node.middleWareType}` : iconTemp;
          }
          break;
        default:
          break;
      }
      node.svgIcon = iconTemp.toUpperCase();
      node.svgIconBright = `${node.svgIcon}_BRIGHT`;
      node.criticalEventIcon = 'EVENT_CRITICAL';
      node.warningEventIcon = 'EVENT_WARNING';
    },
    animate() {
      if (this.simulation) {
        this.simulation.stop();
      }
      this.simulation = this.simulate(this.nodes, this.links);
      this.startSimulation(this.simulation);
    },
    simulate(nodes, links) {
      let sim = this.$d3
        .forceSimulation()
        .stop()
        .alpha(0.5)
        .velocityDecay(0.5)
        .nodes(nodes)
        .force(
          'link',
          this.$d3.forceLink(links).id(d => d.id)
        )
        .force(
          'center',
          this.$d3.forceCenter(this.center.x, this.center.y)
        );
      return sim;
    },
    startSimulation(simulation) {
      const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
      for (let i = 0; i < n; i++) {
        simulation.tick();
      }
    },
    setZoom() {
      const zoomed = () => {
        this.$d3
          .select(`#zoomContainer${this.idNamespace}`)
          .attr(
            'transform',
            `translate(${this.$d3.event.transform.x},${this.$d3.event.transform.y}) scale(${this.$d3.event.transform.k})`
          );
      };
      this.zoomController.scaleExtent([0.1, 100]).on('zoom', zoomed);
      this.$d3
        .select(`#netSvg${this.idNamespace}`)
        .call(this.zoomController)
        .on('dblclick.zoom', null);
    },

    // mouse events
    normalAroundHoveredNode() {
      this.elemsAroundPreHovNodeShallow.nodes.forEach(node => {
        node.isBright = false;
        if (!node.isRelatedToCurNode) {
          node.showLabel = false;
        }
      });
      this.elemsAroundPreHovNodeShallow.links.forEach(link => {
        link.isBright = false;
      });
    },
    lightAroundHoveredNode(hoveredNode) {
      this.normalAroundHoveredNode();
      let elemsAround = {
        nodes: [],
        links: [],
      };
      elemsAround.nodes.push(hoveredNode);
      this.links.forEach(link => {
        if (link.sid === hoveredNode.id) {
          elemsAround.nodes.push(link.target);
          elemsAround.links.push(link);
        } else if (link.tid === hoveredNode.id) {
          elemsAround.nodes.push(link.source);
          elemsAround.links.push(link);
        }
      });
      elemsAround.nodes.forEach(node => {
        node.isBright = true;
        node.showLabel = true;
      });
      elemsAround.links.forEach(link => {
        link.isBright = true;
      });
      this.elemsAroundPreHovNodeShallow = elemsAround;
    },
    mouseEnterNode(event, hoveredNode) {
      this.$jq(`link-anchors${this.idNamespace} .link-anchor`).addClass('link-anchor-static');
      this.lightAroundHoveredNode(hoveredNode);
    },
     mouseLeaveNode(event, elem) {
      this.$jq(`link-anchors${this.idNamespace} .link-anchor`).removeClass('link-anchor-static');
      this.normalAroundHoveredNode();
      this.elemsAroundPreHovNodeShallow = null;
      this.elemsAroundPreHovNodeShallow = {
        nodes: [],
        links: [],
      };
    },
    normalAroundHoveredLink() {
      this.elemsAroundPreHovLinkShallow.nodes.forEach(node => {
        node.isBright = false;
        if (!node.isRelatedToCurNode) {
          node.showLabel = false;
        }
      });
      this.elemsAroundPreHovLinkShallow.links.forEach(link => {
        link.isBright = false;
        link.showLabel = false;
      });
    },
    lightAroundHoveredLink(event, hoveredLink) {
      this.normalAroundHoveredLink();
      let elemsAround = {
        nodes: [],
        links: [],
      };
      elemsAround.links.push(hoveredLink);
      elemsAround.nodes.push(hoveredLink.source);
      elemsAround.nodes.push(hoveredLink.target);

      elemsAround.links.forEach(link => {
        link.isBright = true;
        link.showLabel = true;
      });
      elemsAround.nodes.forEach(node => {
        node.isBright = true;
        node.showLabel = true;
      });
      this.elemsAroundPreHovLinkShallow = elemsAround;
    },
    mouseEnterLinkAnchor(event, hoveredLink) {
      // this.$refs.svg.$forceUpdate();
      let offsetX = this.$jq(`#netContent${this.idNamespace}`).offset().left - this.$jq(window).scrollLeft();
      let offsetY = this.$jq(`#netContent${this.idNamespace}`).offset().top - this.$jq(window).scrollTop();
      this.linkTextContent = `
          <div class="mb-5"><span class="grey">${this.$t('topoDetail_link_type')}</span>${hoveredLink.type}</div>
          <div class="mb-5"><span class="grey">${this.$t('topoDetail_link_callPerMinute')}</span>${
        hoveredLink.callPerMinute === undefined
          ? ' '
          : `${hoveredLink.callPerMinute} ${this.$t('topoDetail_link_callPerMinute_unit')}`
      }</div>
          <div><span class="grey">${this.$t('topoDetail_link_responseTimePerMin')}</span>${
        hoveredLink.responseTimePerMin === undefined
          ? ' '
          : `${hoveredLink.responseTimePerMin} ${this.$t('topoDetail_link_responseTimePerMin_unit')}`
      }</div>
        `;
      this.linkTextVisible = true;
      this.linkTextStyle = {
        height: `${75}px`,
        left: `${event.clientX - offsetX + 8}px`,
        top: `${event.clientY - offsetY - 75}px`,
      };
      this.isLinkTextDark = hoveredLink.isDark;
      this.lightAroundHoveredLink(event, hoveredLink);
    },
    mouseLeaveLinkAnchor(event, hoveredLink) {
      this.linkTextVisible = false;
      this.linkTextContent = '';
      this.linkTextStyle = {
        height: `${0}px`,
        left: `${0}px`,
        top: `${0}px`,
      };
      this.isLinkTextDark = hoveredLink.isDark;
      this.normalAroundHoveredLink();
      this.elemsAroundPreHovLinkShallow = null;
      this.elemsAroundPreHovLinkShallow = {
        nodes: [],
        links: [],
      };
    },
    handleClickNet() {
      if (this.isAutoReloadTopo) {
        this.$store.commit('rocketTopo/SET_IS_AUTO_RELOAD_TOPO', false);
      }
      this.simulation.stop();
    },
    nodeDblClick(event, node) {
      this.$emit('node-dblclick', event, node);
    },
    nodeClick(event, node) {
      this.$emit('node-click', event, node);
    },
    quickexploreClick(event, node) {
      this.$emit('quickexplore-click', event, node);
    },
    mouseDownNode(event, node) {
      if (event.button === 2) {
        this.$emit('node-right-click', event, node);
      }
    },

    // utils
    methodCall(action, args) {
      let method = this[action];
      if (method && typeof method === 'function') {
        if (args) {
          method(...args);
        } else {
          method();
        }
      }
    },
  },
  render(createElement) {
    let ref = 'svg';
    let props = {};
    let renderer = 'svg-renderer';
    let bindProps = [
      'size',
      'nodes',
      'links',
      'nodeSize',
      'fontSize',
      'linkWidth',
      'nodeLabels',
      'linkLabels',
      'labelOffset',
      'linkTextStyle',
      'isLinkTextDark',
      'linkTextVisible',
      'linkTextContent',
      'idNamespace',
      'currentNode',
      'layerOptions',
    ];
    for (let prop of bindProps) {
      props[prop] = this[prop];
    }
    return createElement(
      'div',
      {
        attrs: { class: 'layered-net' },
        on: {
          click: this.handleClickNet,
        },
      },
      [
        createElement(renderer, {
          props,
          ref,
          on: { action: this.methodCall },
        }),
      ]
    );
  },
};
</script>

<style lang="scss">
.layered-net {
    width: 100%;
    height: 100%;
    margin: 0;

    .net-content {
        width: 100%;
        height: 100%;
        position: relative;

        .linkText {
            position: absolute;
            z-index: 999;
            background-color: #252a2f;
            border-radius: 2px;
            color: white;
            padding: 2px;
            text-align: left;
            opacity: 0.8;
            pointer-events: none !important;

            &.dark-linkText {
                opacity: 0.1;
            }
        }

        .arrows .dark-arrow {
            opacity: 0.8;
        }

        .arrows .bright-arrow {
            fill: rgba(255, 255, 0, 1) !important;
        }

        .net-svg {
            margin-top: 100px;

            .node {
                stroke-linecap: round;
                transition: translate 0.5s ease;

                &.node-svg {
                    pointer-events: none;
                }

                &.node-agent {
                    opacity: 0;
                }

                &.dark-node {
                    opacity: 0.1;
                }

                &.bright-node {
                    fill: rgba(255, 255, 0, 1) !important;
                }

                &.pinned {
                    stroke: rgba(255, 255, 0, 1) !important;
                }
            }

            .warn-icon-in-main-topo {
                width: 18px;
                height: 18px;
                overflow: hidden;
                fill: currentColor;
                color: #efeff1;
                pointer-events: none;

                &.dark-warn-icon {
                    opacity: 0.1;
                }

                &.bright-warn-icon {
                    color: rgba(255, 255, 0, 1) !important;
                }
            }

            .fold-icon-in-main-topo {
                &.dark-fold-icon {
                    opacity: 0.1;
                }

                &.quickexplore-agent {
                    opacity: 0;
                    cursor: pointer;
                }
            }

            .link {
                stroke: rgba(18, 120, 98, 0.3);
                fill: none;

                &.dark-link {
                    opacity: 0.1;
                }

                &.bright-link {
                    stroke: rgba(255, 255, 0, 1) !important;
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

            .link-indicator {
                pointer-events: none;
                fill: #ccc;

                &.dark-link-indicator {
                    opacity: 0.1;
                }
            }

            .link-anchor {
                &.dark-link-anchor {
                    opacity: 0.1;
                }

                &.bright-link-anchor {
                    fill: rgba(255, 255, 0, 1) !important;
                }
            }

            .link-anchor-static {
                pointer-events: none;
            }

            .curve {
                fill: none;
            }

            .node-label {
                pointer-events: none;
                fill: #ccc;

                &.dark-node-label {
                    opacity: 0.1;
                }
            }

            .link-label {
                fill: #ccc;
                transform: translate(0, -1.5em);
                text-anchor: middle;
            }

            .layer-line {
                stroke: #ccc;
                opacity: 0.2;
            }
        }
    }
}
</style>
