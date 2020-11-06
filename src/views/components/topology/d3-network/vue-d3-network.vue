<script>
  // import * as forceSimulation from 'd3-force'
  import * as d3 from 'd3';
  import svgRenderer from './components/svgRenderer.vue';
  import saveImage from './lib/js/saveImage.js';
  import svgExport from './lib/js/svgExport.js';
  import { NODES, LINKS } from './data-20.js';

  // const d3 = Object.assign({}, forceSimulation)

  import $jq from 'jquery';

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
            mousemove: this.mouseMove,
            '&touchmove': this.mouseMove,
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
      // this.buildNodes(this.netNodes)
      // this.links = this.buildLinks(this.netLinks)
      this.nodes = NODES;
      this.links = LINKS;
      this.updateNodeSvg();
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
      netNodes(newValue) {
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
      mouseMove(event) {
        let pos = this.clientPos(event);
        if (this.dragging !== false) {
          if (this.nodes[this.dragging]) {
            this.simulation.restart();
            this.simulation.alpha(0.5);
            // this.nodes[this.dragging].fx = pos.x - offsetX;
            // this.nodes[this.dragging].fy = pos.y - offsetY;
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
      dragStart(event, nodeKey) {
        event.stopPropagation();
        this.dragging = nodeKey === false ? false : nodeKey;
        this.setMouseOffset(event, this.nodes[nodeKey]);
        if (this.dragging === false) {
          this.simulation.alpha(0.1);
          this.simulation.restart();
          this.setMouseOffset();
        }
      },
      dragEnd() {
        event.stopPropagation();
        let node = this.nodes[this.dragging];
        if (node && !node.pinned) {
          node.fx = null;
          node.fy = null;
        }
        this.dragStart(event, false);
      },
      // -- Render helpers
      nodeClick(event, node) {
        this.$emit('node-click', event, node);
        if (event && node) {
          let pos = this.clientPos(event);
          let centerX = $jq('#netSvg').width() / 2;
          let centerY = $jq('#netSvg').height() / 2;
          let offsetX = $jq('#netSvg').offset().left;
          let offsetY = $jq('#netSvg').offset().top;
          let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
          let newZoomK = zoomK < 3 ? 3 : zoomK;

          // 拓扑回到视口中心
          this.zoomController.translateTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            centerX,
            centerY,
          );

          setTimeout(() => {
            // 选中点居中
            if (this.currentNode.id !== undefined) {
              this.currentNode.fx = null;
              this.currentNode.fy = null;
            }
            node.fx = centerX;
            node.fy = centerY;
            this.$store.commit('rocketTopo/SET_NODE', node);

            // 放大拓扑
            this.zoomController.scaleTo(
              d3
                .select('.net-svg')
                .transition()
                .duration(500),
              newZoomK,
            );
          }, 510);

          // this.zoomController.translateBy(
          //   d3
          //     .select('.net-svg')
          //     .transition()
          //     .duration(500),
          //   (centerX + offsetX - pos.x) / zoomK,
          //   (centerY + offsetY - pos.y) / zoomK,
          // );
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
  @import 'lib/scss/vars.scss';
  .net {
    width: 100%;
    height: 100%;
    margin: 0;

    .arrows .dark-arrow {
      opacity: 0.5;
    }

    .arrows .bright-arrow {
      fill: yellow !important;
    }

    .net-svg {
      .node {
        stroke: rgba(18, 120, 98, 0.7);
        stroke-width: 3px;
        // transition: fill 0.5s ease;
        fill: $white;

        &.dark-node {
          opacity: 0.5;
        }

        &.bright-node {
          fill: yellow;
        }

        &.selected {
          stroke: $color2;
        }

        &.pinned {
          stroke: rgba(190, 56, 93, 0.6);
        }
      }

      .link {
        stroke: rgba(18, 120, 98, 0.3);

        &.dark-link {
          opacity: 0.5;
        }

        &.bright-link {
          stroke: yellow !important;
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
        fill: $dark;
      }

      .link-label {
        fill: $dark;
        transform: translate(0, -1.5em);
        text-anchor: middle;
      }
    }
  }
</style>
