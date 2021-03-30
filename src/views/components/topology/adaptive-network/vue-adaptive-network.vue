<script>
import SvgRenderer from './components/svg-renderer.vue';

export default {
  name: 'AdaptiveNetwork',
  components: {
    SvgRenderer,
  },
  props: {
    netData: {
      type: Object,
    },
    options: {
      type: Object,
    },
    nodeSym: {
      type: String,
    },
    nodeCb: {
      type: Function,
    },
    linkCb: {
      type: Function,
    },
    simCb: {
      type: Function,
    },
    customForces: {
      type: Object,
    },
    selection: {
      type: Object,
      default: () => ({
        nodes: {},
        links: {},
      }),
    },
    currentNode: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      nodes: [],
      links: [],
      preNetData: { nodes: [], links: [] },
      size: { w: 500, h: 500 },
      offset: { x: 0, y: 0 },
      clientOffset: { x: 0, y: 0 },
      force: 500,
      forces: { Center: false, X: 0.5, Y: 0.5, ManyBody: true, Link: true },
      noNodes: false,
      strLinks: true,
      fontSize: 16,
      dragging: false,
      linkWidth: 1,
      nodeLabels: false,
      linkLabels: false,
      nodeSize: 20,
      mouseOfst: { x: 0, y: 0 },
      padding: { x: 0, y: 0 },
      simulation: null,
      nodeSvg: null,
      resizeListener: true,
      linkTextStyle: { height: 0, left: 0, top: 0 },
      isLinkTextDark: false,
      linkTextVisible: false,
      linkTextContent: '',
      nodeSingleClicked: true,
      clickNodeTimer: null,
      topoTickCount: 0,
      defaultNodeSize: 20,
      defaultLinkWidth: 1,
      nodeNumSmall: 20,
      nodeNumDiff: 10,
      defaultFontSize: 16,
      elemsAroundPreHovNodeDeep: { nodes: [], links: [] },
      elemsAroundPreHovNodeShallow: { nodes: [], links: [] },
      elemsAroundPreHovLinkShallow: { nodes: [], links: [] },
      tip: null,
      isNodesChanged: false,
      deltaIterateNum: 50,
      idNamespace: 'MainTopo',
      topoScaleFix: -1,
      zoomController: this.$d3.zoom(),
    };
  },
  computed: {
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    isAutoReloadTopo() {
      return this.$store.state.rocketTopo.isAutoReloadTopo;
    },
    isTopoLinksUpdated() {
      return this.$store.state.rocketTopo.isTopoLinksUpdated;
    },
    showNodeTypes() {
      return this.$store.state.rocketTopo.showNodeTypes;
    },
    elemIdsRTCAll() {
      return this.$store.state.rocketTopo.elemIdsRTCAll;
    },
    selected() {
      return this.selection.nodes;
    },
    linksSelected() {
      return this.selection.links;
    },
    center() {
      return {
        x: this.size.w / 2 + this.offset.x,
        y: this.size.h / 2 + this.offset.y,
      };
    },
    labelOffset() {
      return {
        x: this.nodeSize / 2 + this.fontSize / 2,
        y: this.fontSize / 2,
      };
    },
  },
  watch: {
    netData(newVal, oldVal) {
      this.preNetData = oldVal;
      this.updateOptions(this.options);
      this.buildNodes(newVal.nodes);
      this.buildLinks(newVal.links);
      this.animate();
    },
    options(newValue, oldValue) {
      this.updateOptions(newValue);
      if (oldValue.size && newValue.size) {
        if (oldValue.size.w !== newValue.size.w || oldValue.size.h !== newValue.size.h) {
          this.onResize();
        }
      }
      this.animate();
    },
  },
  created() {
    this.updateOptions(this.options);
    this.buildNodes(this.netData.nodes);
    this.buildLinks(this.netData.links);
  },
  mounted() {
    this.onResize();
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
      this.setZoom();
      this.animate();
    });
    if (this.resizeListener) {
      window.addEventListener('resize', this.onResize);
    }
  },
  beforeDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.onResize);
    }
  },
  methods: {
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
    getScaleFixForSim(nodes, fix) {
      if (nodes.length === 0) {
        return 1;
      }
      if (nodes.length <= 2) {
        return 2;
      }
      let centerX = this.$jq(`#netSvg${this.idNamespace}`).width() / 2;
      let centerY = this.$jq(`#netSvg${this.idNamespace}`).height() / 2;
      let xMin = nodes[0].x;
      let xMax = nodes[0].x;
      let yMin = nodes[0].y;
      let yMax = nodes[0].y;
      for (let i = 0; i < nodes.length; i++) {
        xMin = xMin > nodes[i].x ? nodes[i].x : xMin;
        xMax = xMax < nodes[i].x ? nodes[i].x : xMax;
        yMin = yMin > nodes[i].y ? nodes[i].y : yMin;
        yMax = yMax < nodes[i].y ? nodes[i].y : yMax;
      }
      let scaleFixX = 1;
      let scaleFixY = 1;
      let scaleFix = 1;
      scaleFixX = (fix * 2 * centerX) / (xMax - xMin);
      scaleFixY = (fix * 2 * centerY) / (yMax - yMin);
      scaleFix = Math.min(scaleFixX, scaleFixY);
      scaleFix = scaleFix <= 0 ? 1 : scaleFix;
      return scaleFix;
    },
    getScaleFixOnCurNode(curNode, nodes, fix, isOnNodeSize) {
      if (nodes.length === 0) {
        return 1;
      }
      if (nodes.length <= 1) {
        return 3 * this.topoScaleFix;
      }
      let centerX = this.$jq(`#netSvg${this.idNamespace}`).width() / 2;
      let centerY = this.$jq(`#netSvg${this.idNamespace}`).height() / 2;
      let curNodeX = curNode.x;
      let curNodeY = curNode.y;

      let toCnxMax = Math.abs(nodes[0].x - curNodeX);
      let toCnyMax = Math.abs(nodes[0].y - curNodeY);
      let toCnx = 0;
      let toCny = 0;
      for (let i = 0; i < nodes.length; i++) {
        toCnx = Math.abs(nodes[i].x - curNodeX);
        toCny = Math.abs(nodes[i].y - curNodeY);
        toCnxMax = toCnxMax < toCnx ? toCnx : toCnxMax;
        toCnyMax = toCnyMax < toCny ? toCny : toCnyMax;
      }
      let scaleFixX = 1;
      let scaleFixY = 1;
      let scaleFix = 1;
      if (isOnNodeSize) {
        scaleFixX = (fix * centerX) / (toCnxMax + this.nodeSize);
        scaleFixY = (fix * centerY) / (toCnyMax + this.nodeSize);
      } else {
        scaleFixX = (fix * centerX) / toCnxMax;
        scaleFixY = (fix * centerY) / toCnyMax;
      }
      scaleFix = Math.min(scaleFixX, scaleFixY);
      scaleFix = scaleFix <= 0 ? 1 : scaleFix;
      return scaleFix;
    },
    fixTopoScaleOnCoord(nodes) {
      let scaleFix = 1;
      if (nodes.length <= this.nodeNumSmall) {
        scaleFix = this.getScaleFixForSim(nodes, 0.6);
      } else {
        scaleFix = this.getScaleFixForSim(nodes, 0.8);
      }
      this.topoScaleFix = scaleFix;
    },
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
    // -- Data
    updateOptions(options) {
      for (let op in options) {
        if (Object.prototype.hasOwnProperty.call(this, op)) {
          this[op] = options[op];
        }
      }
      this.defaultNodeSize = this.nodeSize;
      this.defaultFontSize = this.fontSize;
    },
    setElementAttribute(elem, key, value) {
      if (!Object.prototype.hasOwnProperty.call(elem, key)) {
        this.$set(elem, key, value);
      }
    },
    buildNodes(nodes) {
      this.isNodesChanged = nodes.length !== this.preNetData.nodes.length;
      this.nodes = nodes.map((item, index) => {
        let node = this.itemCb(this.nodeCb, item);
        if (!node.id && node.id !== 0) {
          this.$set(node, 'id', '');
        }
        if (!node.x) {
          this.$set(node, 'x', 0);
        }
        if (!node.y) {
          this.$set(node, 'y', 0);
        }
        if (nodes.length >= this.nodeNumDiff) {
          for (let i = 0; i < this.preNetData.nodes.length; i++) {
            if (node.id === this.preNetData.nodes[i].id) {
              node.x = this.preNetData.nodes[i].x;
              node.y = this.preNetData.nodes[i].y;
              node.fx = this.preNetData.nodes[i].x;
              node.fy = this.preNetData.nodes[i].y;
              break;
            }
          }
        }
        if (!node.name && node.name !== '0') {
          this.$set(node, 'name', '');
        }
        if (node.type) {
          this.setNodeIcon(node);
        }
        this.setElementAttribute(node, 'showLabel', false);
        this.setElementAttribute(node, 'isDark', false);
        this.setElementAttribute(node, 'isBright', false);
        this.setElementAttribute(node, 'isRelatedToCurNode', false);
        this.$set(node, '_color', 'rgba(33, 126, 242, 0.373)');
        return node;
      });
    },
    buildLinks(links) {
      this.links = links.map((item, index) => {
        let link = this.itemCb(this.linkCb, item);
        link.source = link.sid;
        link.target = link.tid;
        if (!link.id) {
          this.$set(link, 'id', `link-${index}`);
        }
        this.setElementAttribute(link, 'showLabel', false);
        this.setElementAttribute(link, 'isDark', false);
        this.setElementAttribute(link, 'isBright', false);
        this.setElementAttribute(link, 'isRelatedToCurNode', false);
        this.$set(link, '_color', 'rgba(33, 126, 242, 0.373)');
        return link;
      });
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
    itemCb(cb, item) {
      let itemTmp = item;
      if (cb && typeof cb === 'function') {
        itemTmp = cb(itemTmp);
      }
      return itemTmp;
    },
    // -- Animation
    simulate(nodes, links) {
      let forces = this.forces;
      let sim = this.$d3
        .forceSimulation()
        .stop()
        .alpha(0.5) // 0.5以0.01的速度衰减到0.01，控制它们，让布局更合理
        // .alphaMin(0.01)
        // .alphaDecay(0.01)
        .velocityDecay(0.5) // 控制节点速度
        .nodes(nodes);

      if (forces.Center !== false) {
        sim.force('center', this.$d3.forceCenter(this.center.x, this.center.y));
      }
      if (forces.X !== false) {
        sim.force('X', this.$d3.forceX(this.center.x).strength(forces.X));
      }
      if (forces.Y !== false) {
        sim.force('Y', this.$d3.forceY(this.center.y).strength(forces.Y));
      }
      if (forces.ManyBody !== false) {
        sim.force('charge', this.$d3.forceManyBody().strength(-this.force));
      }

      if (forces.Link !== false) {
        sim.force(
          'link',
          this.$d3.forceLink(links).id(d => d.id)
        );
      }
      sim = this.setCustomForces(sim);
      sim = this.itemCb(this.simCb, sim);
      return sim;
    },
    setCustomForces(sim) {
      let forces = this.customForces;
      if (forces) {
        for (let f in forces) {
          if (Object.prototype.hasOwnProperty.call(forces, f)) {
            let d3Func = this.getD3Func(`force${f}`);
            if (d3Func) {
              let args = forces[f];
              sim.force(`custom${f}`, d3Func(...args));
            }
          }
        }
      }
      return sim;
    },
    getD3Func(name) {
      let func = this.$d3[name];
      if (func && typeof func === 'function') {
        return func;
      }
      return null;
    },
    setTopoScaleFix(nodes, links) {
      let vNodes = JSON.parse(JSON.stringify(nodes));
      let vLinks = JSON.parse(JSON.stringify(links));
      let vSimulation = this.simulate(vNodes, vLinks);
      if (vSimulation) {
        vSimulation.stop();
      }
      this.startSimulation(vSimulation, vNodes, true);
    },
    async animate() {
      this.topoTickCount = 0;
      if (this.isNodesChanged) {
        await this.setTopoScaleFix(this.nodes, this.links);
      }
      if (this.simulation) {
        this.simulation.stop();
      }
      if (this.forces.Link) {
        this.simulation = this.simulate(this.nodes, this.links);
      } else {
        this.simulation = this.simulate(this.nodes);
      }
      this.startSimulation(this.simulation, this.nodes, false);
    },
    startSimulation(simulation, nodes, isVsim) {
      const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
      this.startIteration(0, n, simulation, nodes, isVsim);
    },
    startIteration(start, n, simulation, nodes, isVsim) {
      for (let i = start; i < start + this.deltaIterateNum; i++) {
        if (i >= n) {
          return;
        }
        simulation.tick();
        if (isVsim) {
          if (i === n - 1) {
            this.simulationTicked(nodes);
          } else {
            this.simulationTicking(nodes);
          }
        } else {
          if (i === start + this.deltaIterateNum - 1 || i === n - 1) {
            this.fixTopoViewOnScale(nodes);
          }
        }
      }
      setTimeout(() => {
        this.startIteration(start + this.deltaIterateNum, n, simulation, nodes, isVsim);
      }, 0);
    },
    fixTopoViewOnScale(nodes) {
      let scaleFix = this.topoScaleFix;
      if (nodes.length > 2 && scaleFix > 1) {
        this.nodeSize = this.defaultNodeSize / scaleFix;
        this.linkWidth = this.defaultLinkWidth / scaleFix;
        this.fontSize = this.defaultFontSize / scaleFix;
      }
      this.zoomController.scaleTo(
        this.$d3
          .select(`#netSvg${this.idNamespace}`)
          .transition()
          .duration(5),
        scaleFix
      );
    },
    simulationTicking(nodes) {
      if (nodes.length > 0) {
        this.topoTickCount++;
        if (this.topoTickCount % 2 === 0) {
          this.fixTopoScaleOnCoord(nodes);
        }
      }
    },
    simulationTicked(nodes) {
      if (nodes.length > 0) {
        this.topoTickCount = 0;
        this.fixTopoScaleOnCoord(nodes);
      }
    },
    reset() {
      this.animate();
      this.nodes = this.simulation.nodes();
      if (this.forces.links) {
        this.links = this.simulation.force('link').links();
      }
    },
    onResize() {
      let size = this.options.size;
      if (!size || !size.w) {
        this.size.w = this.$el.clientWidth;
      }
      if (!size || !size.h) {
        this.size.h = this.$el.clientHeight;
      }
      this.padding.x = 0;
      this.padding.y = 0;
      // serach offsets of parents
      if (this.$parent) {
        this.padding.x += this.$el.offsetLeft || 0;
        this.padding.y += this.$el.offsetTop || 0;
        let vm = this.$parent;
        while (vm.$parent) {
          this.padding.x += vm.$el.offsetLeft || 0;
          this.padding.y += vm.$el.offsetTop || 0;
          vm = vm.$parent;
        }
      }
      // this.animate();
    },
    // -- Mouse Interaction
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
      // 注意，这里记录的上一个hover节点被light前的周边元素集合，深拷贝
      this.elemsAroundPreHovNodeDeep = JSON.parse(JSON.stringify(elemsAround));
      elemsAround.nodes.forEach(node => {
        node.isBright = true;
        node.showLabel = true;
      });
      elemsAround.links.forEach(link => {
        link.isBright = true;
      });
      // 注意，这里记录的上一个hover节点被light后的周边元素集合，浅拷贝
      this.elemsAroundPreHovNodeShallow = elemsAround;
    },
    mouseEnterNode(event, hoveredNode) {
      // 强制更新svgRenderer组件，防止mouseEnterNode后视图样式无法更新
      this.$refs.svg.$forceUpdate();
      this.$jq(`link-anchors${this.idNamespace} .link-anchor`).addClass('link-anchor-static');
      this.lightAroundHoveredNode(hoveredNode);
    },
    mouseLeaveNode(event, elem) {
      this.$refs.svg.$forceUpdate();
      this.$jq(`link-anchors${this.idNamespace} .link-anchor`).removeClass('link-anchor-static');
      this.normalAroundHoveredNode();
      this.elemsAroundPreHovNodeShallow = null;
      this.elemsAroundPreHovNodeShallow = {
        nodes: [],
        links: [],
      };
      this.elemsAroundPreHovNodeDeep = null;
      this.elemsAroundPreHovNodeDeep = {
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
    mouseEnterLink(event, hoveredLink) {
      if (hoveredLink.type === 'TracingTo' || hoveredLink.type === 'SubTracingTo') {
        return;
      }
      this.$refs.svg.$forceUpdate();
      let offsetX = this.$jq(`#netContent${this.idNamespace}`).offset().left - this.$jq(window).scrollLeft();
      let offsetY = this.$jq(`#netContent${this.idNamespace}`).offset().top - this.$jq(window).scrollTop();
      this.linkTextStyle = {
        height: `${25}px`,
        left: `${event.clientX - offsetX + 8}px`,
        top: `${event.clientY - offsetY - 25}px`,
      };
      this.isLinkTextDark = hoveredLink.isDark;
      this.linkTextContent = hoveredLink.type;
      this.linkTextVisible = true;
      this.lightAroundHoveredLink(event, hoveredLink);
    },
    mouseLeaveLink(event, hoveredLink) {
      if (hoveredLink.type === 'TracingTo' || hoveredLink.type === 'SubTracingTo') {
        return;
      }
      this.$refs.svg.$forceUpdate();
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
    mouseEnterLinkAnchor(event, hoveredLink) {
      this.$refs.svg.$forceUpdate();
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
      this.$refs.svg.$forceUpdate();
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
    clientPos(event) {
      let x = event.clientX;
      let y = event.clientY;
      x = x || 0;
      y = y || 0;
      return { x, y };
    },
    handleClickNet(event) {
      if (this.clickNodeTimer) {
        clearTimeout(this.clickNodeTimer);
        this.clickNodeTimer = null;
      }

      if (this.isAutoReloadTopo) {
        this.$store.commit('rocketTopo/SET_IS_AUTO_RELOAD_TOPO', false);
      }
      this.simulation.stop();
      this.dragging = false;
    },
    mouseMoveNet(event) {
      if (this.dragging !== false) {
        if (this.nodes[this.dragging]) {
          let pos = this.clientPos(event);
          let zoomK = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.idNamespace}`).node()).k;
          let zoomX = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.idNamespace}`).node()).x;
          let zoomY = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.idNamespace}`).node()).y;
          let offsetX = this.$jq(`#netSvg${this.idNamespace}`).offset().left - this.$jq(window).scrollLeft();
          let offsetY = this.$jq(`#netSvg${this.idNamespace}`).offset().top - this.$jq(window).scrollTop();
          let centerX = this.$jq(`#netSvg${this.idNamespace}`).width() / 2;
          let centerY = this.$jq(`#netSvg${this.idNamespace}`).height() / 2;
          this.nodes[this.dragging].fx =
            centerX - (centerX + offsetX - pos.x) / zoomK - (zoomX + centerX * (zoomK - 1)) / zoomK;
          this.nodes[this.dragging].fy =
            centerY - (centerY + offsetY - pos.y) / zoomK - (zoomY + centerY * (zoomK - 1)) / zoomK;
          this.nodes[this.dragging].x = this.nodes[this.dragging].fx;
          this.nodes[this.dragging].y = this.nodes[this.dragging].fy;
        }
      }
    },
    dragNodeStart(event, nodeKey, node) {
      // 鼠标右键点击节点
      if (event.button === 2) {
        return;
      }

      // 区分拖拽 单击节点
      this.nodeSingleClicked = true;
      this.clickNodeTimer = setTimeout(() => {
        this.nodeSingleClicked = false;
        this.dragging = nodeKey;
        this.setMouseOffset(event, this.nodes[nodeKey]);
      }, 200);
    },
    dragNodeEnd(event, nodeKey, node) {
      // 鼠标右键点击节点
      if (event.button === 2) {
        this.$emit('node-right-click', event, node);
        return;
      }
      if (this.nodeSingleClicked) {
        clearTimeout(this.clickNodeTimer);
        this.clickNodeTimer = null;
        this.nodeClick(event, node);
        return;
      }
      this.nodes[this.dragging].fx = null;
      this.nodes[this.dragging].fy = null;
      this.dragging = false;
      this.setMouseOffset();
    },
    // -- Render helpers
    setViewportNodes(curNode, nodesTmp, isFixed) {
      if (this.elemIdsRTCAll.nodeIds.length > 0 && isFixed) {
        // 上下游视口
        this.nodes.forEach(node => {
          if (this.elemIdsRTCAll.nodeIds.includes(node.id)) {
            nodesTmp.push(node);
          }
        });
      } else {
        // 单跳视口
        this.links.forEach(link => {
          if (link.sid === curNode.id) {
            nodesTmp.push(link.target);
          }
          if (link.tid === curNode.id) {
            nodesTmp.push(link.source);
          }
        });
      }
    },
    setTopoViewport(curNode, preNode, isFixed) {
      if (curNode && curNode.id === undefined) {
        return;
      }
      this.$refs.svg.$forceUpdate();
      this.simulation.stop();
      this.zoomController.translateTo(
        this.$d3
          .select(`#netSvg${this.idNamespace}`)
          .transition()
          .duration(500),
        curNode.x,
        curNode.y
      );
      setTimeout(() => {
        if (preNode && preNode.id !== undefined) {
          preNode.fx = null;
          preNode.fy = null;
          this.$refs.svg.$forceUpdate();
        }
        if (isFixed) {
          curNode.fx = curNode.x;
          curNode.fy = curNode.y;
          this.$refs.svg.$forceUpdate();
        }
        let nodesTmp = [];
        nodesTmp.push(curNode);
        this.setViewportNodes(curNode, nodesTmp, isFixed);
        let newZoomK = this.getScaleFixOnCurNode(curNode, nodesTmp, 0.9, true);
        this.zoomController.scaleTo(
          this.$d3
            .select(`#netSvg${this.idNamespace}`)
            .transition()
            .duration(500),
          newZoomK
        );
      }, 501);
    },
    quickexploreClick(event, node) {
      this.$emit('quickexplore-click', event, node);
    },
    nodeDblClick(event, node) {
      this.$emit('node-dblclick', event, node);
    },
    nodeClick(event, node) {
      this.$emit('node-click', event, node);
    },
    linkClick(event, link) {
      this.$emit('link-click', event, link);
    },
    setMouseOffset(event, node) {
      let x = 0;
      let y = 0;
      if (event && node) {
        let pos = this.clientPos(event);
        x = pos.x ? pos.x - node.x : node.x;
        y = pos.y ? pos.y - node.y : node.y;
      }
      this.mouseOfst = { x, y };
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
      'selected',
      'linksSelected',
      'strLinks',
      'linkWidth',
      'nodeLabels',
      'linkLabels',
      'fontSize',
      'labelOffset',
      'offset',
      'padding',
      'nodeSize',
      'noNodes',
      'linkTextStyle',
      'isLinkTextDark',
      'linkTextVisible',
      'linkTextContent',
      'idNamespace',
      'currentNode',
    ];
    for (let prop of bindProps) {
      props[prop] = this[prop];
    }
    props.nodeSym = this.nodeSvg;
    return createElement(
      'div',
      {
        attrs: { class: 'adaptive-net' },
        on: {
          mousemove: this.mouseMoveNet,
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
.adaptive-net {
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

                &.selected {
                    stroke: #caa455;
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

                &.dark-link {
                    opacity: 0.1;
                }

                &.bright-link {
                    stroke: rgba(255, 255, 0, 1) !important;
                }

                &.selected {
                    stroke: rgba(202, 164, 85, 0.6);
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
        }
    }
}
</style>
