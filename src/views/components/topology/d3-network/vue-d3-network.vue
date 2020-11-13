<script>
  // import * as forceSimulation from 'd3-force'
  import * as d3 from 'd3';
  import $jq from 'jquery';

  import svgRenderer from './components/svgRenderer.vue';
  import saveImage from './lib/js/saveImage.js';
  import svgExport from './lib/js/svgExport.js';

  // const d3 = Object.assign({}, forceSimulation)

  export default {
    name: 'd3-network',
    components: {
      svgRenderer,
    },
    props: {
      netNodes: {
        type: Array,
      },
      netLinks: {
        type: Array,
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
        fontSize: 10,
        dragging: false,
        linkWidth: 1,
        nodeLabels: false,
        linkLabels: false,
        nodeSize: 5,
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
        linkTextPosition: {
          left: 0,
          top: 0,
        },
        linkTextVisible: false,
        linkTextContent: '',
        nodeClicked: true,
        clickNodeTimer: null,
        isMouseDwonNet: true,
        pallet: [
          '#6be6c1',
          '#a0a7e6',
          '#96dee8',
          '#3f96e3',
          '#3fb1e3',
          '#6be6c1',
          '#626c91',
          '#a0a7e6',
          '#c4ebad',
          '#96dee8',
        ],
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
        'linkTextPosition',
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
            '&touchmove': this.mouseMoveNet,
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
          createElement('div', {
            style: {
              display: 'none',
            },
            domProps: {
              innerHTML: this.relativeNodeType,
            },
          }),
        ],
      );
    },
    created() {
      this.updateOptions(this.options);
      this.buildNodes(this.netNodes);
      this.links = this.buildLinks(this.netLinks);
      this.updateNodeSvg();
      setTimeout(() => {
        this.$store.commit('rocketTopo/SET_TOPO_BASIC_DATA', {
          nodes: this.nodes,
          links: this.links,
        });
      });
    },
    mounted() {
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
      relativeNodeType() {
        return this.$store.state.rocketTopo.relativeNodeType;
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
      relativeNodeType: {
        handler(newVal, oldVal) {
          this.lightAroundCurrentNode(this.currentNode, newVal);
        },
        // deep: true
      },
      currentNode: {
        handler(newVal, oldVal) {
          this.setCurNodePosition(newVal, oldVal);
          this.lightAroundCurrentNode(newVal, this.relativeNodeType);
        },
        // deep: true
      },
      netNodes(newValue) {
        console.log('vue-d3-network knows');
        this.buildNodes(newValue);
        this.reset();
      },
      netLinks(newValue, oldValue) {
        this.links = this.buildLinks(newValue);
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
      handleClickNet(event) {
        if (!this.isMouseDwonNet) {
          this.isMouseDwonNet = true;
          return;
        }
        if (event.target.tagName === 'circle' || event.target.tagName === 'path') {
          return;
        }
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.simulation.restart();
        this.simulation.alpha(0.5);
        this.$store.commit('rocketTopo/SET_NODE', {});
      },
      restoreAroundCurrentNode() {
        this.nodes.forEach((node) => {
          node.isDark = false;
          node.isBright = false;
          node.showLabel = false;
          node.isRelatedToCurNode = false;
        });

        this.links.forEach((link) => {
          link.isDark = false;
          link.isBright = false;
          // link.showLabel = false;
          link.isRelatedToCurNode = false;
        });
      },
      lightAroundCurrentNode(curNode, relativeNodeType) {
        this.restoreAroundCurrentNode();
        if (curNode.id === undefined) {
          return;
        }
        if (!relativeNodeType) {
          relativeNodeType = 'Single Hop';
        }
        if (relativeNodeType === 'Single Hop') {
          const lightdNodeIds = new Set();
          lightdNodeIds.add(curNode.id);
          this.links.forEach((link) => {
            if (link.sid === curNode.id || link.tid === curNode.id) {
              link.isDark = false;
              link.isBright = true;
              // link.showLabel = true;
              link.isRelatedToCurNode = true;

              link.source.isDark = false;
              link.source.isBright = true;
              link.source.showLabel = true;
              link.source.isRelatedToCurNode = true;

              link.target.isDark = false;
              link.target.isBright = true;
              link.target.showLabel = true;
              link.target.isRelatedToCurNode = true;

              lightdNodeIds.add(link.source.id);
              lightdNodeIds.add(link.target.id);
            } else {
              link.isDark = true;
              link.isBright = false;
              // link.showLabel = false;
              link.isRelatedToCurNode = false;

              if (!lightdNodeIds.has(link.source.id)) {
                link.source.isDark = true;
                link.source.isBright = false;
                link.source.showLabel = false;
                link.source.isRelatedToCurNode = false;
              }
              if (!lightdNodeIds.has(link.target.id)) {
                link.target.isDark = true;
                link.target.isBright = false;
                link.target.showLabel = false;
                link.target.isRelatedToCurNode = false;
              }
            }
          });
          this.nodes.forEach((node) => {
            if (!lightdNodeIds.has(node.id) && !node.isRelatedToCurNode) {
              node.isDark = true;
              node.isBright = false;
              node.showLabel = false;
              node.isRelatedToCurNode = false;
            } else {
              node.isDark = false;
              node.isBright = true;
              node.showLabel = true;
              node.isRelatedToCurNode = true;
            }
          });
          return;
        }
        if (relativeNodeType === 'All Streams') {
          // query
          return;
        }
        if (relativeNodeType === 'Up Stream') {
          // query
          return;
        }
        if (relativeNodeType === 'Down Stream') {
          // query
          return;
        }
      },
      restoreAroundELemHovered() {
        this.linkTextVisible = false;
        this.linkTextContent = '';
        this.linkTextPosition = {
          left: 0 + 'px',
          top: 0 + 'px',
        };

        this.nodes.forEach((node) => {
          if (!node.isRelatedToCurNode) {
            node.isDark = false;
            node.isBright = false;
            node.showLabel = false;
          }
        });

        this.links.forEach((link) => {
          if (!link.isRelatedToCurNode) {
            link.isDark = false;
            link.isBright = false;
            link.showLabel = false;
          }
        });
      },
      lightAroundELemHovered(event, type, elem) {
        if (type === 'node') {
          const lightdNodeIds = new Set();
          lightdNodeIds.add(elem.id);
          this.links.forEach((link) => {
            if (link.sid === elem.id || link.tid === elem.id) {
              link.isDark = false;
              link.isBright = true;
              link.showLabel = true;

              link.source.isDark = false;
              link.source.isBright = true;
              link.source.showLabel = true;

              link.target.isDark = false;
              link.target.isBright = true;
              link.target.showLabel = true;

              lightdNodeIds.add(link.source.id);
              lightdNodeIds.add(link.target.id);
            } else {
              if (!link.isRelatedToCurNode) {
                link.isDark = true;
                link.isBright = false;
                link.showLabel = false;
              }

              if (!lightdNodeIds.has(link.source.id) && !link.source.isRelatedToCurNode) {
                link.source.isDark = true;
                link.source.isBright = false;
                link.source.showLabel = false;
              }
              if (!lightdNodeIds.has(link.target.id) && !link.target.isRelatedToCurNode) {
                link.target.isDark = true;
                link.target.isBright = false;
                link.target.showLabel = false;
              }
            }
          });
          this.nodes.forEach((node) => {
            if (!lightdNodeIds.has(node.id) && !node.isRelatedToCurNode) {
              node.isDark = true;
              node.isBright = false;
              node.showLabel = false;
            } else {
              node.isDark = false;
              node.isBright = true;
              node.showLabel = true;
            }
          });
        } else if (type === 'link') {
          // 边提示
          let offsetX = $jq('#netContent').offset().left;
          let offsetY = $jq('#netContent').offset().top;
          this.linkTextPosition = {
            left: event.clientX - offsetX + 10 + 'px',
            top: event.clientY - offsetY - 25 + 'px',
          };
          this.linkTextContent = elem.type;
          this.linkTextVisible = true;

          this.links.forEach((link) => {
            if (link.id === elem.id) {
              link.isDark = false;
              link.isBright = true;
              link.showLabel = true;
            } else {
              if (!link.isRelatedToCurNode) {
                link.isDark = true;
                link.isBright = false;
                link.showLabel = false;
              }
            }
          });

          this.nodes.forEach((node) => {
            if (node.id === elem.source.id || node.id === elem.target.id) {
              node.isDark = false;
              node.isBright = true;
              node.showLabel = true;
            } else {
              if (!node.isRelatedToCurNode) {
                node.isDark = true;
                node.isBright = false;
                node.showLabel = false;
              }
            }
          });
        }
      },
      mouseEnterNode(event, elem) {
        if (this.currentNode.id !== undefined) {
          // 已选中节点，enter节点无效
          return;
        }
        this.lightAroundELemHovered(event, 'node', elem);
      },
      mouseLeaveNode(event, elem) {
        if (this.currentNode.id !== undefined) {
          // 已选中节点，leave节点无效
          return;
        }
        this.restoreAroundELemHovered();
      },
      mouseEnterLink(event, elem) {
        if (this.currentNode.id !== undefined) {
          // 已选中节点，enter关联边才有效
          if (elem.isRelatedToCurNode) {
            // 边提示
            let offsetX = $jq('#netContent').offset().left;
            let offsetY = $jq('#netContent').offset().top;
            this.linkTextPosition = {
              left: event.clientX - offsetX + 10 + 'px',
              top: event.clientY - offsetY - 25 + 'px',
            };
            this.linkTextContent = elem.type;
            this.linkTextVisible = true;
          }
          return;
        }
        this.lightAroundELemHovered(event, 'link', elem);
      },
      mouseLeaveLink(event, elem) {
        if (this.currentNode.id !== undefined) {
          this.linkTextVisible = false;
          this.linkTextContent = '';
          this.linkTextPosition = {
            left: 0 + 'px',
            top: 0 + 'px',
          };
          return;
        }
        this.restoreAroundELemHovered();
      },
      updateNodeSvg() {
        let svg = null;
        if (this.nodeSym) {
          svg = svgExport.svgElFromString(this.nodeSym);
        }
        this.nodeSvg = svg;
      },
      methodCall(action, args) {
        let method = this[action];
        if (method && typeof method === 'function') {
          if (args) method(...args);
          else method();
        }
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
        this.animate();
      },
      // -- Data
      updateOptions(options) {
        for (let op in options) {
          if (this.hasOwnProperty(op)) {
            this[op] = options[op];
          }
        }
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
          vm.$set(node, 'showLabel', false);
          vm.$set(node, 'isDark', false);
          vm.$set(node, 'isBright', false);
          vm.$set(node, 'isRelatedToCurNode', false);

          let nodeColor = '';
          switch (
            node.type // 调色板如何解耦？
          ) {
            case 'App':
              nodeColor = this.pallet[0];
              break;
            case 'Middleware':
              nodeColor = this.pallet[1];
              break;
            case 'Process':
              nodeColor = this.pallet[2];
              break;
            case 'Deployment':
              nodeColor = this.pallet[3];
              break;
            case 'Pod':
              nodeColor = this.pallet[4];
              break;
            case 'Node':
              nodeColor = this.pallet[5];
              break;
          }
          vm.$set(node, '_color', nodeColor);

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
          vm.$set(link, 'showLabel', false);
          vm.$set(link, 'isDark', false);
          vm.$set(link, 'isBright', false);
          vm.$set(link, 'isRelatedToCurNode', false);

          // let linkColor = link.type === 'tracingto' ? this.pallet[8] : this.pallet[9];
          vm.$set(link, '_color', 'rgba(33, 126, 242, 0.373)');

          return link;
        });
      },
      itemCb(cb, item) {
        if (cb && typeof cb === 'function') item = cb(item);
        return item;
      },
      // -- Animation
      simulate(nodes, links) {
        let forces = this.forces;
        let sim = d3
          .forceSimulation()
          .stop()
          .alpha(0.5)
          // .alphaMin(0.05)
          .nodes(nodes);

        if (forces.Center !== false) sim.force('center', d3.forceCenter(this.center.x, this.center.y));
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
      // -- Mouse Interaction
      mouseUpNet(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('mouseUpNet');
      },
      mouseDownNet(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('mouseDownNet');
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
      clientPos(event) {
        let x = event.touches ? event.touches[0].clientX : event.clientX;
        let y = event.touches ? event.touches[0].clientY : event.clientY;
        x = x || 0;
        y = y || 0;
        return { x, y };
      },
      dragNodeStart(event, nodeKey, node) {
        // 区分net拖拽和点击
        this.isMouseDwonNet = false;

        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }

        // 区分节点拖拽和点击
        this.nodeClicked = true;
        this.clickNodeTimer = setTimeout(() => {
          this.nodeClicked = false;
        }, 200);

        this.dragging = nodeKey === false ? false : nodeKey;
        this.setMouseOffset(event, this.nodes[nodeKey]);
        if (this.dragging === false) {
          this.simulation.alpha(0.1);
          this.simulation.restart();
          this.setMouseOffset();
        }
      },
      dragNodeEnd(event, nodeKey, node) {
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }

        if (this.nodeClicked) {
          clearTimeout(this.clickNodeTimer);
          this.nodeClick(event, node);
        }

        let nodeDragging = this.nodes[this.dragging];
        if (nodeDragging && !nodeDragging.pinned) {
          nodeDragging.fx = null;
          nodeDragging.fy = null;
        }
        this.dragNodeStart(event, false);
      },
      // -- Render helpers
      setCurNodePosition(curNode, preNode, event = null) {
        if (curNode && curNode.id === undefined) {
          return;
        }
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let offsetX = $jq('#netSvg').offset().left;
        let offsetY = $jq('#netSvg').offset().top;
        let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
        let zoomX = d3.zoomTransform(d3.select('#zoomContainer').node()).x;
        let zoomY = d3.zoomTransform(d3.select('#zoomContainer').node()).y;
        let newZoomK = zoomK < 2 ? 2 : zoomK;

        /* 移动方式一 */
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
          }
          curNode.fx = curNode.x;
          curNode.fy = curNode.y;

          this.zoomController.scaleTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            newZoomK,
          );
        }, 501);
      },
      nodeClick(event, node) {
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }
        this.$emit('node-click', event, node);
        if (event && node) {
          this.$store.commit('rocketTopo/SET_NODE', node);
        }
      },
      linkClick(event, link) {
        this.$emit('link-click', event, link);
      },
      setMouseOffset(event, node) {
        let x = 0;
        let y = 0;
        if (event && node) {
          let pos = this.clientPos(event);
          // let zoomTimes = d3.zoomTransform(d3.select('#zoomContainer').node()).k
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
      }

      .arrows .dark-arrow {
        opacity: 0.5;
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
            opacity: 0.3;
          }

          &.bright-node {
            fill: rgba(255, 255, 0, 1) !important;
          }

          &.selected {
            stroke: #caa455;
          }

          &.pinned {
            stroke: #ccc;
          }
        }

        .event-node-main-topo {
          width: 18px;
          height: 18px;
          overflow: hidden;
          fill: currentColor;
          color: #efeff1;
          pointer-events: none;
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
