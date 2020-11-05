<template>
  <div class="micro-topo-chart"></div>
</template>
<script lang="js">
  import * as d3 from 'd3';
  import d3tip from 'd3-tip';
  import zoom from './utils/zoom';
  import { simulationInit, simulationSkip } from './utils/simulation';
  import { nodeElement, linkElement, anchorElement } from './utils/initElement';
  import tool from './utils/tool';

  import LOCAL_STATE_TOPO from './data.js';

  export default {
    props: {
      current: {
        type: Object,
        default: () => ({}),
      },
      nodesx: {
        type: Array,
        default: () => [],
      },
      linksx: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        height: 600,
        simulation: '',
        nodes: [],
        links: []
      };
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    },
    mounted() {
      window.addEventListener('resize', this.resize);
      this.drawTopo();
    },
    // watch: {
    //   nodes: 'update',
    //   links: 'update',
    // },
    methods: {
      drawTopo() {
        this.nodes = LOCAL_STATE_TOPO.nodes;
        this.links = LOCAL_STATE_TOPO.calls;

        const topoSize = {
          width: this.$el.clientWidth,
          height: this.$el.clientHeight
        };

        // 设置仿真
        this.simulation = simulationInit(d3, this.nodes, this.links, this.ticked, topoSize);

        // 初始画布
        this.svg = d3
          .select(this.$el) // this.$el指向元素.micro-topo-chart
          .append('svg')
          .attr('class', 'topo-svg')
          .attr('height', this.$el.clientHeight);
        this.graph = this.svg.append('g').attr('class', 'topo-svg_graph');

         // 设置提示，单元素
        this.tip = d3tip()
          .attr('class', 'd3-tip')
          .offset([-8, 0]);
        this.graph.call(this.tip);

         // 设置工具小六边形，单元素
        const shapeOption = {
          side: 6,
          centerRadius: 25,
          hexagonRadius: 10,
          fixAngle: Math.PI / 2,
          iconSize: 12,
        };
        this.tool = tool(this.graph, [
          {icon: 'API', click: this.handleGoEndpoint},
          {icon: 'INSTANCE', click: this.handleGoInstance},
          {icon: 'TRACE', click: this.handleGoTrace},
          {icon: 'ALARM', click: this.handleGoAlarm},
          {icon: 'ENDPOINT', click: this.handleGoEndpointDependency},
          {icon: ''},
        ], shapeOption);

        // 设置边
        this.link = linkElement(this.graph.append('g').selectAll('.topo-line').data(this.links).enter());

        // 设置点
        this.node = nodeElement(d3, this.graph.append('g').selectAll('.topo-node').data(this.nodes).enter(), this.tool, {
          dragstart: this.dragstart,
          dragged: this.dragged,
          dragended: this.dragended,
          handleNodeClick: this.handleNodeClick,
        }, this.tip);

        // 设置缩放
        this.svg.call(zoom(d3, this.graph));

        // 点击事件
        this.svg.on('click', (d, i) => {
          event.stopPropagation();
          event.preventDefault();
          this.$store.commit('rocketTopo/SET_NODE', {});
          this.$store.commit('rocketTopo/SET_LINK', {});
          this.$store.dispatch('rocketTopo/CLEAR_TOPO_INFO');
          this.tool.attr('style', 'display: none');
        });
      },

      ticked() {
        this.link.attr('d', (d) =>
        {
          return `M${d.source.x} ${d.source.y} Q ${(d.source.x + d.target.x) / 2} ${(d.target.y + d.source.y) / 2 - 90} ${d.target.x} ${d.target.y}`;
        });
        this.node.attr('transform', (d) => {
          return `translate(${d.x},${d.y})`;
        });
      },

      dragstart(d) {
        this.node._groups[0].forEach((g) => {
          g.__data__.fx = g.__data__.x;
          g.__data__.fy = g.__data__.y;
        });
        if (!d3.event.active) {
          this.simulation.alphaTarget(0.1).restart();
        }
        d3.event.sourceEvent.stopPropagation();

        // if (!d3.event.active) {
        //   this.simulation.alphaTarget(0.3).restart();
        // }
        // d.fx = d.x;
        // d.fy = d.y;
      },

      dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        d.x = d.fx;
        d.y = d.fy;

        // d.fx = d3.event.x;
        // d.fy = d3.event.y;
      },

      dragended() {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0);
        }

        // if (!d3.event.active) {
        //   simulation.alphaTarget(0);
        // }
        // d.fx = null;
        // d.fy = null;
      },

      handleGoAlarm() {
        this.$emit('setDialog', 'alarm');
      },

      handleGoTrace() {
        this.$emit('setDialog', 'trace');
      },

      handleGoInstance() {
        this.$emit('setDialog', 'instance');
      },

      handleGoEndpoint() {
        this.$store.dispatch('SELECT_SERVICE', {
          service: { key: this.current.id, label: this.current.name },
          duration: this.$store.getters.durationTime,
        });
        this.$emit('setDialog', 'endpoint');
      },

      handleGoEndpointDependency() {
        this.$emit('setDialog', 'endpoint_dependency');
      },

      handleNodeClick(d) {
        this.$emit('setCurrent', { key: d.id, label: d.name });
        const {x, y, vx, vy, fx, fy, index, ...rest} = d;
        this.$store.dispatch('rocketTopo/CLEAR_TOPO_INFO');
        this.$store.commit('rocketTopo/SET_NODE', rest);
        this.$store.commit('rocketTopo/SET_LINK', {});
      },

      handleLinkClick(d) {
        event.stopPropagation();
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_LINK', d);
        this.$store.dispatch('rocketTopo/CLEAR_TOPO_INFO');
        this.$store.commit('rocketTopo/SET_MODE', d.detectPoints);
        this.$store.dispatch(this.$store.state.rocketTopo.mode ? 'rocketTopo/GET_TOPO_SERVICE_INFO' :
            'rocketTopo/GET_TOPO_CLIENT_INFO', { ...d, duration: this.$store.getters.durationTime });
        this.$store.commit('rocketTopo/SET_CALLBACK', () => {
          this.$store.dispatch(this.$store.state.rocketTopo.mode ? 'rocketTopo/GET_TOPO_SERVICE_INFO' :
            'rocketTopo/GET_TOPO_CLIENT_INFO', { ...d, duration: this.$store.getters.durationTime });
        });
      },

      resize() {
        this.svg.attr('height', this.$el.clientHeight);
      },
    },
  };
</script>
<style lang="scss">
  .micro-topo-chart {
    height: 100%;
    width: 100%;
    .topo-svg {
      display: block;
      width: 100%;
    }
    .topo-line {
      stroke-linecap: round;
      stroke-width: 1.3px !important;
      // stroke-dasharray: 13 7;
      fill: none;
      // animation: topo-dash 1s linear infinite !important;
    }
    .topo-line-anchor {
      cursor: pointer;
    }
    .topo-text {
      font-family: 'Lato', 'Source Han Sans CN', 'Microsoft YaHei', sans-serif;
      fill: #ddd;
      font-size: 11px;
      opacity: 0.8;
    }
    .topo-tool {
      display: none;
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
  @keyframes topo-dash {
    from {
      stroke-dashoffset: 20;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
