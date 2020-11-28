<script>
  // import * as forceSimulation from 'd3-force'
  import * as d3 from 'd3';
  import $jq from 'jquery';

  import svgRenderer from './components/svgRenderer.vue';
  import saveImage from './lib/js/saveImage.js';
  import svgExport from './lib/js/svgExport.js';
  import { defaults } from 'lodash';

  // const d3 = Object.assign({}, forceSimulation)

  export default {
    name: 'd3-network',
    components: {
      svgRenderer,
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
        default: () => {
          return {
            nodes: {},
            links: {},
          };
        },
      },
    },
    data() {
      return {
        nodes: [],
        links: [],
        size: {
          w: 500,
          h: 500,
        },
        offset: {
          x: 0,
          y: 0,
        },
        clientOffset: {
          x: 0,
          y: 0,
        },
        force: 500,
        forces: {
          Center: false,
          X: 0.5,
          Y: 0.5,
          ManyBody: true,
          Link: true,
        },
        noNodes: false,
        strLinks: true,
        fontSize: 16,
        dragging: false,
        linkWidth: 1,
        nodeLabels: false,
        linkLabels: false,
        nodeSize: 20,
        mouseOfst: {
          x: 0,
          y: 0,
        },
        padding: {
          x: 0,
          y: 0,
        },
        simulation: null,
        nodeSvg: null,
        resizeListener: true,
        linkTextStyle: {
          left: 0,
          top: 0,
        },
        isLinkTextDark: false,
        linkTextVisible: false,
        linkTextContent: '',
        nodeSingleClicked: true,
        clickNodeTimer: null,
        isMouseDwonNet: true,
        pallet: [
          '#3fb1e3',
          '#a0a7e6',
          '#96dee8',
          '#3f96e3',
          '#6be6c1',
          '#6be6c1',
          '#626c91',
          '#a0a7e6',
          '#c4ebad',
          '#96dee8',
        ],
        topoTickCount: 0,
        defaultNodeSize: 20,
        defaultLinkWidth: 1,
        nodeNumSmall: 20,
        defaultFontSize: 16,
        elemsAroundPreHovNodeDeep: {
          nodes: [],
          links: [],
        },
        elemsAroundPreHovNodeShallow: {
          nodes: [],
          links: [],
        },
        elemsAroundPreHovLinkShallow: {
          nodes: [],
          links: [],
        },
      };
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
      ];

      for (let prop of bindProps) {
        props[prop] = this[prop];
      }
      props.nodeSym = this.nodeSvg;

      return createElement(
        'div',
        {
          attrs: { class: 'net' },
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
        ],
      );
    },
    created() {
      this.updateOptions(this.options);
      this.buildNodes(this.netData.nodes);
      this.links = this.buildLinks(this.netData.links);
      this.updateNodeSvg();
    },
    mounted() {
      this.$store.commit('rocketTopo/SET_NETWORK_INSTANCE', this);
      this.onResize();
      this.$nextTick(() => {
        this.animate();
      });
      if (this.resizeListener) window.addEventListener('resize', this.onResize);
    },
    beforeDestroy() {
      if (this.resizeListener) window.removeEventListener('resize', this.onResize);
    },
    computed: {
      isTopoNodesUpdated() {
        return this.$store.state.rocketTopo.isTopoNodesUpdated;
      },
      isTopoLinksUpdated() {
        return this.$store.state.rocketTopo.isTopoLinksUpdated;
      },
      isFirstTick() {
        return this.$store.state.rocketTopo.isFirstTick;
      },
      topoScaleFix() {
        return this.$store.state.rocketTopo.topoScaleFix;
      },
      showNodeTypes() {
        return this.$store.state.rocketTopo.showNodeTypes;
      },
      elemIdsRTCAll() {
        return this.$store.state.rocketTopo.elemIdsRTCAll;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      zoomController() {
        return this.$store.state.rocketTopo.zoomController;
      },
      selected() {
        return this.selection.nodes;
      },
      linksSelected() {
        return this.selection.links;
      },
      center() {
        return {
          x: this.size.w / 2 + this.size.w / 200 + this.offset.x,
          y: this.size.h / 2 + this.size.h / 200 + this.offset.y,
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
      netData(newVal) {
        this.updateOptions(this.options);
        // this.resetElemsSize();
        this.buildNodes(newVal.nodes);
        this.links = this.buildLinks(newVal.links);
        this.reset();
      },
      nodeSym() {
        this.updateNodeSvg();
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
    methods: {
      resetElemsSize() {
        this.nodeSize = 20;
        this.linkWidth = 1;
        this.fontSize = 16;
      },
      getScaleFixForSim(nodes, fix) {
        if (nodes.length === 1) {
          return 2;
        }
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
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
        return scaleFix;
      },
      getScaleFixOnCurNode(nodes, fix, isOnNodeSize) {
        if (nodes.length === 1) {
          // 单个节点,在20基础上放大2倍
          return 2 * this.topoScaleFix;
        }
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let curNodeX = this.currentNode.x;
        let curNodeY = this.currentNode.y;

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
        return scaleFix;
      },
      fixTopoScale(isSetTopoScaleFix, isEnlargeTopo) {
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let bounds = d3
          .select('#zoomContainer')
          .node()
          .getBBox();
        let scaleFixX = (0.8 * centerX) / (centerX - bounds.x); // 负数的情况?
        let scaleFixY = (0.8 * centerY) / (centerY - bounds.y);
        let scaleFix = Math.min(scaleFixX, scaleFixY);
        if (isEnlargeTopo) {
          if (this.nodes.length <= 20) {
            scaleFix = this.getScaleFixForSim(this.nodes, 0.6);
          } else {
            scaleFixX = (0.8 * centerX) / (centerX - bounds.x); // 负数的情况?
            scaleFixY = (0.8 * centerY) / (centerY - bounds.y);
            scaleFix = Math.min(scaleFixX, scaleFixY);
          }
          // 布局时,放大拓扑,要同时缩小元素
          this.nodeSize = this.defaultNodeSize / scaleFix;
          this.linkWidth = this.defaultLinkWidth / scaleFix;
          this.fontSize = this.defaultFontSize / scaleFix;
        }
        if (isSetTopoScaleFix) {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', scaleFix);
        }
        this.zoomController.scaleTo(
          d3
            .select('.net-svg')
            .transition()
            .duration(200),
          scaleFix,
        );
      },
      methodCall(action, args) {
        let method = this[action];
        if (method && typeof method === 'function') {
          if (args) method(...args);
          else method();
        }
      },
      // -- Data
      updateOptions(options) {
        for (let op in options) {
          if (this.hasOwnProperty(op)) {
            this[op] = options[op];
          }
        }
        this.defaultNodeSize = this.nodeSize;
        this.defaultFontSize = this.fontSize;
      },
      buildNodes(nodes) {
        let vm = this;
        this.nodes = nodes.map((node, index) => {
          // node formatter option
          node = this.itemCb(this.nodeCb, node);
          // index as default node id
          if (!node.id && node.id !== 0) vm.$set(node, 'id', index);
          // initialize node coords
          if (!node.x) vm.$set(node, 'x', 0);
          if (!node.y) vm.$set(node, 'y', 0);
          // node default name, allow string 0 as name
          if (!node.name && node.name !== '0') vm.$set(node, 'name', 'node ' + node.id);
          if (node.svgSym) {
            node.svgIcon = svgExport.svgElFromString(node.svgSym);
            if (node.svgIcon && !node.svgObj) node.svgObj = svgExport.toObject(node.svgIcon);
          }
          if (this.isTopoNodesUpdated) {
            vm.$set(node, 'showLabel', false);
            vm.$set(node, 'isDark', false);
            vm.$set(node, 'isBright', false);
            vm.$set(node, 'isRelatedToCurNode', false);
            let nodeColor = '';
            switch (
              node.type // 调色板如何解耦？
            ) {
              case 'Application':
                nodeColor = this.pallet[0];
                break;
              case 'Middleware':
                nodeColor = this.pallet[1];
                break;
              case 'Process':
                nodeColor = this.pallet[2];
                break;
              case 'Workload':
                nodeColor = this.pallet[3];
                break;
              case 'Pod':
                nodeColor = this.pallet[4];
                break;
              case 'Node':
                nodeColor = this.pallet[5];
                break;
              default:
                nodeColor = '#dcfaf3';
                break;
            }
            vm.$set(node, '_color', nodeColor);
          }
          if (this.isTopoNodesUpdated && index === nodes.length - 1) {
            this.$store.commit('rocketTopo/SET_IS_TOPO_NODES_UPDATED', false);
          }
          return node;
        });
      },
      buildLinks(links) {
        let vm = this;
        return links.concat().map((link, index) => {
          // link formatter option
          link = this.itemCb(this.linkCb, link);
          // source and target for d3
          link.source = link.sid;
          link.target = link.tid;
          if (!link.id) vm.$set(link, 'id', 'link-' + index);
          if (this.isTopoLinksUpdated) {
            vm.$set(link, 'showLabel', false);
            vm.$set(link, 'isDark', false);
            vm.$set(link, 'isBright', false);
            vm.$set(link, 'isRelatedToCurNode', false);
            vm.$set(link, '_color', 'rgba(33, 126, 242, 0.373)');
          }
          if (this.isTopoLinksUpdated && index === links.length - 1) {
            this.$store.commit('rocketTopo/SET_IS_TOPO_LINKS_UPDATED', false);
          }
          return link;
        });
      },
      itemCb(cb, item) {
        if (cb && typeof cb === 'function') item = cb(item);
        return item;
      },
      updateNodeSvg() {
        let svg = null;
        if (this.nodeSym) {
          svg = svgExport.svgElFromString(this.nodeSym);
        }
        this.nodeSvg = svg;
      },
      // -- Animation
      simulate(nodes, links) {
        let forces = this.forces;
        let sim = d3
          .forceSimulation()
          .stop()
          .alpha(0.5) // 0.5以0.01的速度衰减到0.01，控制它们，让布局更合理
          .alphaMin(0.01)
          .alphaDecay(0.01)
          .velocityDecay(0.5) // 控制节点速度
          .nodes(nodes);

        if (forces.Center !== false) {
          sim.force('center', d3.forceCenter(this.center.x, this.center.y));
        }
        if (forces.X !== false) {
          sim.force('X', d3.forceX(this.center.x).strength(forces.X));
        }
        if (forces.Y !== false) {
          sim.force('Y', d3.forceY(this.center.y).strength(forces.Y));
        }
        if (forces.ManyBody !== false) {
          sim.force('charge', d3.forceManyBody().strength(-this.force));
        }

        if (forces.Link !== false) {
          sim.force(
            'link',
            d3.forceLink(links).id(function(d) {
              return d.id;
            }),
          );
        }
        sim.on('tick', () => {
          if (this.isFirstTick) {
            if (this.nodes.length > this.nodeNumSmall) {
              console.log('tick');
              let bounds = d3
                .select('#zoomContainer')
                .node()
                .getBBox();
              if (bounds.x !== 0 && bounds.y !== 0) {
                this.topoTickCount++;
              }
              if (this.topoTickCount % 5 === 1) {
                if (bounds.x < 0 || bounds.y < 0) {
                  this.fixTopoScale(true, false);
                } else {
                  this.fixTopoScale(true, true);
                }
              }
            } else if (this.nodes.length > 1 && this.nodes.length <= this.nodeNumSmall) {
              this.topoTickCount++;
              if (this.topoTickCount % 3 === 0) {
                this.fixTopoScale(true, true);
              }
            }
          }
        });
        sim.on('end', () => {
          if (this.isFirstTick) {
            this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', false);
            this.topoTickCount = 0;
            if (this.nodes.length > this.nodeNumSmall) {
              console.log('tick end');
              this.fixTopoScale(true, false);
            } else if (this.nodes.length <= this.nodeNumSmall) {
              this.fixTopoScale(true, true);
            }
          }
        });

        sim = this.setCustomForces(sim);
        sim = this.itemCb(this.simCb, sim);
        return sim;
      },
      setCustomForces(sim) {
        let forces = this.customForces;
        if (forces) {
          for (let f in forces) {
            let d3Func = this.getD3Func('force' + f);
            if (d3Func) {
              let args = forces[f];
              sim.force('custom' + f, d3Func(...args));
            }
          }
        }
        return sim;
      },
      getD3Func(name) {
        let func = d3[name];
        if (func && typeof func === 'function') return func;
        return null;
      },
      animate() {
        if (this.simulation) this.simulation.stop();
        if (this.forces.Link !== false) this.simulation = this.simulate(this.nodes, this.links);
        else this.simulation = this.simulate(this.nodes);
        this.simulation.restart();
      },
      reset() {
        this.animate();
        this.nodes = this.simulation.nodes();
        if (this.forces.links) this.links = this.simulation.force('link').links();
      },
      onResize() {
        let size = this.options.size;
        if (!size || !size.w) this.size.w = this.$el.clientWidth;
        if (!size || !size.h) this.size.h = this.$el.clientHeight;
        this.padding.x = 0;
        this.padding.y = 0;
        // serach offsets of parents
        let vm = this;
        while (vm.$parent) {
          this.padding.x += vm.$el.offsetLeft || 0;
          this.padding.y += vm.$el.offsetTop || 0;
          vm = vm.$parent;
        }
        // this.animate();
      },
      // -- Mouse Interaction
      normalAroundHoveredNode() {
        this.elemsAroundPreHovNodeShallow.nodes.forEach((node) => {
          node.isBright = false;
          if (!node.isRelatedToCurNode) {
            node.showLabel = false;
          }
        });
        this.elemsAroundPreHovNodeShallow.links.forEach((link) => {
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
        this.links.forEach((link) => {
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
        elemsAround.nodes.forEach((node) => {
          node.isBright = true;
          node.showLabel = true;
        });
        elemsAround.links.forEach((link) => {
          link.isBright = true;
        });
        // 注意，这里记录的上一个hover节点被light后的周边元素集合，浅拷贝
        this.elemsAroundPreHovNodeShallow = elemsAround;
      },
      mouseEnterNode(event, hoveredNode) {
        // 强制更新svgRenderer组件，防止mouseEnterNode后视图样式无法更新
        this.$refs.svg.$forceUpdate();
        this.lightAroundHoveredNode(hoveredNode);
      },
      mouseLeaveNode(event, elem) {
        this.$refs.svg.$forceUpdate();
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
        this.elemsAroundPreHovLinkShallow.nodes.forEach((node) => {
          node.isBright = false;
          if (!node.isRelatedToCurNode) {
            node.showLabel = false;
          }
        });
        this.elemsAroundPreHovLinkShallow.links.forEach((link) => {
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

        elemsAround.links.forEach((link) => {
          link.isBright = true;
          link.showLabel = true;
        });
        elemsAround.nodes.forEach((node) => {
          node.isBright = true;
          node.showLabel = true;
        });
        this.elemsAroundPreHovLinkShallow = elemsAround;
      },
      mouseEnterLink(event, hoveredLink) {
        this.$refs.svg.$forceUpdate();
        let offsetX = $jq('#netContent').offset().left;
        let offsetY = $jq('#netContent').offset().top;
        this.linkTextStyle = {
          left: event.clientX - offsetX + 10 + 'px',
          top: event.clientY - offsetY - 25 + 'px',
        };
        this.isLinkTextDark = hoveredLink.isDark;
        this.linkTextContent = hoveredLink.type;
        this.linkTextVisible = true;
        this.lightAroundHoveredLink(event, hoveredLink);
      },
      mouseLeaveLink(event, hoveredLink) {
        this.$refs.svg.$forceUpdate();
        this.linkTextVisible = false;
        this.linkTextContent = '';
        this.linkTextStyle = {
          left: 0 + 'px',
          top: 0 + 'px',
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
        this.simulation.stop();
        if (this.isFirstTick) {
          this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', false);
        }
        this.dragging = false; // 防止快速拖拽释放后,无法触发dragNodeEnd
        if (!this.isMouseDwonNet) {
          // 阻止选中节点被拖拽
          this.isMouseDwonNet = true;
          return;
        }
        if (event.target.className.baseVal.includes('node')) {
          return;
        }
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$refs.svg.$forceUpdate();
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
      },
      mouseMoveNet(event) {
        if (this.dragging !== false) {
          if (this.nodes[this.dragging]) {
            if (this.nodes[this.dragging].id === this.currentNode.id) {
              return;
            }
            this.simulation.restart();
            this.simulation.alpha(0.5);
            let pos = this.clientPos(event);
            // 适配缩放后的拖拽
            let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
            let zoomX = d3.zoomTransform(d3.select('#zoomContainer').node()).x;
            let zoomY = d3.zoomTransform(d3.select('#zoomContainer').node()).y;
            let offsetX = $jq('#netSvg').offset().left;
            let offsetY = $jq('#netSvg').offset().top;
            let centerX = $jq('#netSvg').width() / 2;
            let centerY = $jq('#netSvg').height() / 2;
            this.nodes[this.dragging].fx =
              centerX - (centerX + offsetX - pos.x) / zoomK - (zoomX + centerX * (zoomK - 1)) / zoomK;
            this.nodes[this.dragging].fy =
              centerY - (centerY + offsetY - pos.y) / zoomK - (zoomY + centerY * (zoomK - 1)) / zoomK;
          }
        }
      },
      dragNodeStart(event, nodeKey, node) {
        this.isMouseDwonNet = false;

        // 区分拖拽 单击节点
        this.nodeSingleClicked = true;
        this.clickNodeTimer = setTimeout(() => {
          this.nodeSingleClicked = false;
        }, 100);

        // 拖拽 双击被选中节点无效
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }
        this.dragging = nodeKey;
        this.setMouseOffset(event, this.nodes[nodeKey]);
      },
      dragNodeEnd(event, nodeKey, node) {
        if (this.nodeSingleClicked) {
          clearTimeout(this.clickNodeTimer);
          this.nodeClick(event, node);
        }

        // 拖拽 双击被选中节点无效
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }
        this.nodes[this.dragging].fx = null;
        this.nodes[this.dragging].fy = null;
        this.dragging = false;
        this.simulation.alpha(0.1);
        this.simulation.restart();
        this.setMouseOffset();
      },
      // -- Render helpers
      setTopoViewport(curNode, preNode, event = null) {
        if (curNode && curNode.id === undefined) {
          return;
        }
        this.$refs.svg.$forceUpdate();
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let offsetX = $jq('#netSvg').offset().left;
        let offsetY = $jq('#netSvg').offset().top;
        let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
        let zoomX = d3.zoomTransform(d3.select('#zoomContainer').node()).x;
        let zoomY = d3.zoomTransform(d3.select('#zoomContainer').node()).y;

        // 控制topo时要终止仿真
        this.simulation.stop();
        // 选中节点回到视口中心
        this.zoomController.translateTo(
          d3
            .select('.net-svg')
            .transition()
            .duration(500),
          this.currentNode.x,
          this.currentNode.y,
        );

        // 固定当前节点坐标，并放大拓扑
        setTimeout(() => {
          if (preNode && preNode.id !== undefined) {
            preNode.fx = null;
            preNode.fy = null;
            this.$refs.svg.$forceUpdate();
          }
          curNode.fx = curNode.x;
          curNode.fy = curNode.y;
          this.$refs.svg.$forceUpdate();

          let nodesTmp = [];
          nodesTmp.push(curNode);
          if (this.elemIdsRTCAll.nodeIds.length > 0) {
            // 上下游视口
            this.nodes.forEach((node) => {
              if (this.elemIdsRTCAll.nodeIds.includes(node.id)) {
                nodesTmp.push(node);
              }
            });
          } else {
            // 单跳视口
            this.links.forEach((link) => {
              if (link.sid === curNode.id) {
                nodesTmp.push(link.target);
              }
              if (link.tid === curNode.id) {
                nodesTmp.push(link.source);
              }
            });
          }
          let newZoomK = this.getScaleFixOnCurNode(nodesTmp, 0.9, true);

          this.zoomController.scaleTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            newZoomK,
          );
        }, 501);
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
      screenShot(name, bgColor, toSVG, svgAllCss) {
        let exportFunc;
        let args = [];
        exportFunc = this.$refs.svg.svgScreenShot;
        args = [toSVG, bgColor, svgAllCss];
        if (toSVG) name = name || 'export.svg';

        exportFunc((err, url) => {
          if (!err) {
            if (!toSVG) saveImage.save(url, name);
            else saveImage.download(url, name);
          }
          this.$emit('screen-shot', err);
        }, ...args);
      },
    },
  };
</script>

<style lang="scss">
  // @import 'lib/scss/vars.scss';
  .net {
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
        background-color: rgba(75, 75, 75, 0.596);
        border-radius: 2px;
        color: white;
        padding: 2px;

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
          // stroke: rgba(18, 120, 98, 0.7);
          // stroke-width: 3px;
          transition: translate 0.5s ease;

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
            color: rgba(255, 255, 0, 1) !important; // 如何改变颜色？
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
          animation: topo-dash 1s linear infinite !important;
        }

        @keyframes topo-dash {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .node,
        .link {
          stroke-linecap: round;
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

          // &.bright-node-label {
          //   color: yellow;
          // }
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
