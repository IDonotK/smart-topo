<template>
  <div class="topo-detail">
    <div class="td-item" v-for="(item, index) in navList" :key="index"
      :class="{'tdi-odd': index % 2 != 0, 'tdi-even': index % 2 == 0, 'tdi-select': item.id == selectNav}"
      @click="handleSelectNav(item.id)">
      <div class="tdi-c">
        <div style="width: 300px"></div>
      </div>
    </div>
    <div class="td-topo" ref="tdTopo">
      <div id="tdt-view"></div>
    </div>
  </div>
</template>

<script lang="js">

  import * as d3 from 'd3';
  import d3tip from 'd3-tip';

  import allIcon from './assets/types/all.png';
  import appIcon from './assets/types/app.png';
  import processIcon from './assets/types/process.png';
  import podIcon from './assets/types/pod.png';
  import nodeIcon from './assets/types/node.png';

  import icons from './chart/utils/icons';

  export default {
    data() {
      return {
        topoData: {
          nodes: [
            {
              id: 'app1',
              name: 'app1',
              type: 'App'
            },
            {
              id: 'process1',
              name: 'process1',
              type: 'Process'
            },
            {
              id: 'process2',
              name: 'process2',
              type: 'Process'
            },
            {
              id: 'pod1',
              name: 'pod1',
              type: 'Pod'
            },
            {
              id: 'node1',
              name: 'node1',
              type: 'Node'
            },
          ],
          calls: [
            {
              source: {
                id: 'app1',
                name: 'app1',
                type: 'App'
              },
              target: {
                id: 'process1',
                name: 'process1',
                type: 'Process'
              },
              type: 'createon'
            },
            {
              source: {
                id: 'app1',
                name: 'app1',
                type: 'App'
              },
              target: {
                id: 'process2',
                name: 'process2',
                type: 'Process'
              },
              type: 'createon'
            },
            {
              source: {
                id: 'process1',
                name: 'process1',
                type: 'Process'
              },
              target: {
                id: 'pod1',
                name: 'pod1',
                type: 'Pod'
              },
              type: 'createon'
            },
            {
              source: {
                id: 'process2',
                name: 'process2',
                type: 'Process'
              },
              target: {
                id: 'pod1',
                name: 'pod1',
                type: 'Pod'
              },
              type: 'createon'
            },
            {
              source: {
                id: 'pod1',
                name: 'pod1',
                type: 'Pod'
              },
              target: {
                id: 'node1',
                name: 'node1',
                type: 'Node'
              },
              type: 'createon'
            },
          ]
        },
        navList: [
          // {
          //   id: 'All',
          //   name: 'All',
          //   imgUrl: allIcon,
          //   event: 2,
          //   total: 10
          // },
          {
            id: 'App',
            name: 'Applications',
            imgUrl: appIcon,
            event: 1,
            total: 2
          },
          {
            id: 'Process',
            name: 'Processes',
            imgUrl: processIcon,
            event: 0,
            total: 4
          },
          {
            id: 'Pod',
            name: 'Pods',
            imgUrl: podIcon,
            event: 1,
            total: 2
          },
          {
            id: 'Node',
            name: 'Nodes',
            imgUrl: nodeIcon,
            event: 0,
            total: 2
          }
        ],
      }
    },

    computed: {
      selectNav() {
        return this.$store.state.rocketTopo.filterNodeType;
      },
    },

    mounted() {
      this.drawDetailTopo();
      window.addEventListener('resize', this.resize);
    },

    methods: {
      handleSelectNav(itemId) {
        this.$store.commit('rocketTopo/SET_FILTER_NODE_TYPE', itemId);
      },
      drawDetailTopo() {
        d3.select("#tdt-view svg").remove();

        const graph = this.topoData;
        const topoWidth = this.$refs.tdTopo.clientWidth;
        const topoHeight = this.$refs.tdTopo.clientHeight;
        const deltah = topoHeight / 4;
        let appNum = 0;
        let processNum = 0;
        let podNum = 0;
        let nodeNum = 0;

        const nodesOption = [];
        const linksOption = [];
        graph.nodes.forEach(node => {
          let itemTmp = {
            id: node.id,
            name: node.name,
            type: node.type
          };
          switch (node.type) {
            case 'App': {
                appNum++;
                itemTmp.x = 10 + appNum * 50;
                itemTmp.y = 0.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + appIcon + '';
              } break;
            case 'Process': {
                processNum++;
                itemTmp.x = 10 + processNum * 50;
                itemTmp.y = 1.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + processIcon + '';
              } break;
            case 'Pod': {
                podNum++;
                itemTmp.x = 10 + podNum * 50;
                itemTmp.y = 2.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + podIcon + '';
              } break;
            case 'Node': {
                nodeNum++;
                itemTmp.x = 10 + nodeNum * 50;
                itemTmp.y = 3.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + nodeIcon + '';
              } break;
            default: break;
          }
          nodesOption.push(itemTmp);
        });
        graph.calls.forEach(call => {
          let itemTmp = {
            source: nodesOption.find(node => node.id === call.source.id),
            target: nodesOption.find(node => node.id === call.target.id),
          };
          linksOption.push(itemTmp);
        });

        const svg = d3
          .select('#tdt-view')
          .append('svg')
          .attr('class', 'topo-svg')
          .attr('height', this.$refs.tdTopo.clientHeight)
          .style("border","1px solid #fff");
        
        function tick() {
          nodeEles.attr('transform', d => `translate(${d.fx}, ${d.fy})`);
          linkEles.attr('d', d => `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 - 90} ${d.target.fx} ${d.target.fy}`);
        };
        const force = d3
          .forceSimulation(nodesOption)
          .force("link", d3.forceLink(linksOption).id(d => d.id))
          .on("tick", tick);

        let nodeEles = svg.append('g').selectAll('.topo-node');
        let linkEles = svg.append('g').selectAll('.topo-line'); 
        
        nodeEles = nodeEles.data(nodesOption)
          .enter().append("g")
          .attr("class", "topo-node")
          .on('mouseover', d => { console.log('mouseover'); })
          .on('mouseout', d => { console.log('mouseout'); })
          .on('click', d => { console.log('click'); })
          .append('image')
          .attr('width', 20)
          .attr('height', 20)
          .attr('x', -10)
          .attr('y', -10)
          .attr('style', 'cursor: pointer;')
          .attr('xlink:href', d => icons[d.type.toUpperCase()]);
        
        linkEles = linkEles.data(linksOption)
          .enter().append("path")
          .attr("class", "topo-line")
          .style("stroke", "#217EF25f");

      },
      resize() {
        this.drawDetailTopo();
      },
    }
  }
</script>

<style lang="scss">
  .topo-detail {
    width: 100%;
    height: 100%;
    position: relative;

    .td-item {
      width: 100%;
      height: 25%;
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

      #tdt-view {
        width: 100%;
        height: 100%;

        .topo-svg {
          display: block;
          width: 100%;

          .topo-line {
            stroke-linecap: round;
            stroke-width: 1.3px !important;
            // stroke-dasharray: 13 7;
            fill: none;
            animation: topo-dash 1s linear infinite !important;
          }
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
