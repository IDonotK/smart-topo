<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <div class="tvc-l">
        <TopoDetail
          v-if="currentNode && currentNode.id !== undefined && currentNode.id !== '' && currentNode.id !== null"
        />
        <div class="tvcl-close">
          <span class="tvclc-icon" @click="closeTopoDetail"></span>
        </div>
      </div>
      <div class="tvc-r">
        <RkEcharts height="100%" :option="responseConfig" ref="topo" />
      </div>
    </div>
  </div>
</template>
<script lang="js">
  import * as d3 from 'd3';
  import d3tip from 'd3-tip';

  import TopoDetail from './topo-detail.vue';

  import appIcon from './assets/types/app.png';
  import processIcon from './assets/types/process.png';
  import podIcon from './assets/types/pod.png';
  import nodeIcon from './assets/types/node.png';

  export default {
    props: {
      topoData: {
        type: Object,
        default() {
          return {
            nodes: [],
            calls: [],
          };
        },
      },
    },
    components: {
      TopoDetail
    },
    computed: {
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      responseConfig() {
        const graph = this.topoData;
        // 设置图例
        const categoriesOption = [...new Set(graph.nodes.map((item) => item.type))].map((item) => {
          let itemTmp = {
            name: item,
            textStyle: {
              color: '#ddd', // 设置图例被选中时的字体颜色
            }
          };
          switch (item) {
            case 'App': itemTmp.icon = 'image://' + appIcon + ''; break;
            case 'Process': itemTmp.icon = 'image://' + processIcon + ''; break;
            case 'Pod': itemTmp.icon = 'image://' + podIcon + ''; break;
            case 'Node': itemTmp.icon = 'image://' + nodeIcon + ''; break;
            default: break;
          }
          return itemTmp;
        });
        const legendOption = {
          // top: 25,
          show: false,
          itemGap: 20,
          itemWidth: 20,
          itemHeight: 20,
          selected: {
            'App': true,
            'Process': true,
            'Pod': true,
            'Node': true
          },
          inactiveColor: '#000', // 设置图例未被选中时的字体颜色
          data: categoriesOption,
        }

        const linksOption = [];
        const nodesOption = [];
        graph.calls.forEach((call, index) => {
          linksOption.push({
            index,
            source: call.source.id,
            target: call.target.id,
            type: call.type, // 支持自定义属性
            tooltip: {
              formatter: (params) => { // hover链路内容，待拓展
                // return params.data.type;
                return '';
              },
            },
            emphasis: {
              label: {
                show: true,
                formatter: (params) => { // 高亮链路内容，待拓展
                  return params.data.type;
                },
              }
            }
          });
        });
        graph.nodes.forEach((node) => {
          let itemTmp = {
            id: node.id,
            name: node.name,
            value: 'some msg', // 待拓展
            label: {
              normal: {
                show: true,
              },
            },
            category: node.type,
            tooltip: {
              formatter: '{b} : {c}', // hover节点内容，待拓展
            }
          };
          switch (node.type) {
            case 'App': itemTmp.symbol = 'image://' + appIcon + ''; break;
            case 'Process': itemTmp.symbol = 'image://' + processIcon + ''; break;
            case 'Pod': itemTmp.symbol = 'image://' + podIcon + ''; break;
            case 'Node': itemTmp.symbol = 'image://' + nodeIcon + ''; break;
            default: break;
          }
          nodesOption.push(itemTmp);
        });

        return {
          tooltip: {},
          color: [
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
          legend: legendOption,
          series : [
            {
              legendHoverLink: true,
              hoverAnimation: true,
              focusNodeAdjacency: true,
              edgeSymbol: ['', 'arrow'],
              edgeSymbolSize: [0, 8],
              symbolSize: 16,

              top: '10%',
              height: '75%',
              name: '',
              type: 'graph',
              layout: 'circular',
              circular: {
                  rotateLabel: true,
              },
              nodes: nodesOption,
              links: linksOption,
              categories: categoriesOption,
              roam: true,
              label: {
                normal: {
                  position: 'right',
                  formatter: '{b}',
                },
              },
              lineStyle: {
                normal: {
                  color: 'source',
                  curveness: 0.3,
                },
              },
            },
          ],
        };
      },
    },
    methods: {
      closeTopoDetail() {
        this.$store.commit('rocketTopo/SET_NODE', {});
      }
    },
    mounted() {
      const currentCompIns = this;
      const myChart = this.$refs.topo.myChart;

      myChart.on('click', (params) => {
        const currentNode = this.topoData.nodes.find((item) => item.id === params.data.id);
        if (currentNode) { // 点击节点事件，待拓展
          this.$store.commit('rocketTopo/SET_NODE', currentNode);
          // 被选中节点居中放大
          const optionTmp = myChart.getOption();
          if (optionTmp.series[0].center == null) {
            optionTmp.series[0].center = [myChart.getWidth() / 2, myChart.getHeight() / 2];
          }
          optionTmp.series[0].center = [
            optionTmp.series[0].center[0] + (params.event.offsetX - myChart.getWidth() / 2) / optionTmp.series[0].zoom,
            optionTmp.series[0].center[1] + (params.event.offsetY - myChart.getHeight() / 2) / optionTmp.series[0].zoom
          ];
          optionTmp.series[0].zoom = 3;
          myChart.setOption(optionTmp, true);
        } else {
          this.$store.commit('rocketTopo/SET_NODE', {});
        }
      });

      // 监听图例选中事件
      myChart.on('legendselectchanged', (params) => {
        // 修改responseConfig无法被子组件RkEcharts监听到？
      });
    },
  };
</script>
<style lang="scss">
  .topo-view-chart {
    position: absolute;
    top: 2px;
    left: 220px;
    right: 0;
    bottom: 2px;
    background-color: #333840;
    text-align: center;

    .tvc-c {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;

      .tvc-l {
        -webkit-transition: 0.1s width;
        transition: 0.1s width;
        height: 100%;
        position: relative;

        .tvcl-close {
          position: absolute;
          top: 10px;
          right: 15px;

          .tvclc-icon {
            cursor: pointer;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 16px 12px 16px 0;
            border-color: transparent #ccc transparent transparent;
            display: block;
            z-index: 2;
          }
        }
      }

      .tvc-r {
        flex-grow: 1;
        -webkit-transition: 0.1s width;
        transition: 0.1s width;
        height: 100%;
      }
    }
  }
</style>
