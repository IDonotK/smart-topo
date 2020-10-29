<template>
  <div class="topo-detail" ref="tdDom">
    <div
      class="td-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tdi-odd': index % 2 != 0, 'tdi-even': index % 2 == 0, 'tdi-select': item.id == selectNav }"
      @click="handleSelectNav(item.id)"
    >
      <div class="tdi-c"></div>
    </div>
    <div class="td-topo" ref="tdTopo">
      <div id="tdt-view-cross-layer"></div>
      <div id="tdt-view-same-layer" v-if="showDetailTopoSameLayer">
        <div class="tvsl-close">
          <span class="tvslc-icon" @click="closeDetailTopoSameLayer"></span>
        </div>
        same layer
      </div>
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
  import tool from './chart/utils/tool';

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
        showDetailTopoSameLayer: false,
      }
    },

    computed: {
      selectNav() {
        return this.$store.state.rocketTopo.filterNodeType;
      },
    },

    mounted() {
      this.drawDetailTopoCrossLayer();
      window.addEventListener('resize', this.resize);
    },

    methods: {
      handleSelectNav(itemId) {
        this.$store.commit('rocketTopo/SET_FILTER_NODE_TYPE', itemId);
      },
      drawDetailTopoCrossLayer() {
        d3.select("#tdt-view-cross-layer svg").remove();

        const graph = this.topoData;

        // 计算节点坐标
        const topoHeight = this.$refs.tdTopo.clientHeight;
        const deltah = topoHeight / 4;
        const topoWidthMax = document.getElementById('tvccId').clientWidth;
        let deltaw = 50;

        let appNum = 0;
        let processNum = 0;
        let podNum = 0;
        let nodeNum = 0;
        graph.nodes.forEach(node => {
          switch (node.type) {
            case 'App': appNum++; break;
            case 'Process': processNum++; break;
            case 'Pod': podNum++; break;
            case 'Node': nodeNum++; break;
            default: break;
          }
        });
        let maxNum = Math.max(appNum, processNum, podNum, nodeNum);
        let topoWidth = maxNum * deltaw + 20 > topoWidthMax ? topoWidthMax : maxNum * deltaw + 20;

        let appDeltaX =  (topoWidth - 20) / appNum;
        let processDeltaX =  (topoWidth - 20) / processNum;
        let podDeltaX =  (topoWidth - 20) / podNum;
        let nodeDeltaX =  (topoWidth - 20) / nodeNum;

        let isAppLine2Src = appNum >= processNum ? true : false;
        let isProcessLine2Src = processNum >= podNum ? true : false;
        let isPodLine2Src = podNum >= nodeNum ? true : false;

        appNum = 0;
        processNum = 0;
        podNum = 0;
        nodeNum = 0;

        const nodesOption = [];
        const linksOption = [];
        graph.nodes.forEach(node => {
          let itemTmp = {
            id: node.id,
            name: node.name,
            type: node.type,
          };
          switch (node.type) {
            case 'App': {
                appNum++;
                itemTmp.x = (10 + appDeltaX / 2) + (appNum - 1) * appDeltaX;
                itemTmp.y = 0.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + appIcon + '';
              } break;
            case 'Process': {
                processNum++;
                itemTmp.x = (10 + processDeltaX / 2) + (processNum - 1) * processDeltaX;
                itemTmp.y = 1.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + processIcon + '';
              } break;
            case 'Pod': {
                podNum++;
                itemTmp.x = (10 + podDeltaX / 2) + (podNum - 1) * podDeltaX;
                itemTmp.y = 2.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + podIcon + '';
              } break;
            case 'Node': {
                nodeNum++;
                itemTmp.x = (10 + nodeDeltaX / 2) + (nodeNum - 1) * nodeDeltaX;
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
          switch (call.source.type) {
            case 'App': itemTmp.isLine2Src = isAppLine2Src; break;
            case 'Process': itemTmp.isLine2Src = isProcessLine2Src; break;
            case 'Pod': itemTmp.isLine2Src = isPodLine2Src; break;
            default: break;
          }
          linksOption.push(itemTmp);
        });

        this.$refs.tdDom.style.width = topoWidth + 'px';
        const svg = d3
          .select('#tdt-view-cross-layer')
          .append('svg')
          .attr('class', 'topo-svg')
          .attr('height', this.$refs.tdTopo.clientHeight);

        function tick() {
          nodeEles.attr('transform', d => `translate(${d.fx}, ${d.fy})`);
          linkEles.attr('d', d => {
            if (d.isLine2Src) {
              return `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 - 90} ${d.target.fx} ${d.target.fy}`;
            }
            return `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 + 90 } ${d.target.fx} ${d.target.fy}`;
          });
        };
        const force = d3
          .forceSimulation(nodesOption)
          .force("link", d3.forceLink(linksOption).id(d => d.id))
          .on("tick", tick);

        let nodeEles = svg.append('g').selectAll('.topo-node');
        let linkEles = svg.append('g').selectAll('.topo-line');

        let shapeOption = {
          side: 3,
          centerRadius: 25,
          hexagonRadius: 10,
          fixAngle: Math.PI / 2,
          iconSize: 12,
        };
        let usedTool = tool(svg, [
          {icon: 'TRACE', click: this.handleGoSameLayer},
          {icon: ''},
          {icon: ''},
        ], shapeOption);

        nodeEles = nodeEles.data(nodesOption)
          .enter().append("g")
          .attr("class", "topo-node")
          .on('mouseover', d => { console.log('mouseover'); })
          .on('mouseout', d => { console.log('mouseout'); })
          .on('click', d => {
            event.stopPropagation();
            event.preventDefault();
            usedTool.attr('transform', `translate(${d.x}, ${d.y})`).attr('style', 'display: block');
          })
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

        svg.on('click', (d, i) => {
          event.stopPropagation();
          event.preventDefault();
          usedTool.attr('style', 'display: none');
        });

      },
      drawDetailTopoSameLayer() {
        this.showDetailTopoSameLayer = true;
      },
      handleGoSameLayer() {
        event.stopPropagation();
        event.preventDefault();
        this.drawDetailTopoSameLayer();
      },
      closeDetailTopoSameLayer() {
        event.stopPropagation();
        event.preventDefault();
        this.showDetailTopoSameLayer = false;
      },
      resize() {
        this.drawDetailTopoCrossLayer();
      },
    }
  }
</script>

<style lang="scss">
  .topo-detail {
    // width: 100%;
    height: 100%;
    position: relative;
    -webkit-transition: 0.5s width;
    transition: 0.5s width;

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

      #tdt-view-cross-layer {
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
      }

      #tdt-view-same-layer {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 500px;
        background-color: #252a2f;
        z-index: 999;
        -webkit-transition: 0.5s width;
        transition: 0.5s width;

        .tvsl-close {
          position: absolute;
          top: 10px;
          right: 15px;

          .tvslc-icon {
            cursor: pointer;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 16px 12px 16px 0;
            border-color: transparent #ccc transparent transparent;
            display: block;
            z-index: 1000;
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
