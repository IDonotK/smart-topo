<template>
  <div id="tdt-view-node-detail" class="node-detail">
    <div class="tvsl-close">
      <span class="tvslc-icon" @click="closeNodeDetail"></span>
    </div>
    <div class="tvsl-small-topo">
      <RkEcharts :option="smallTopoOption" ref="smallTopo" />
    </div>
    <div class="tvsl-node-info">
      <div
        class="info-item"
        v-for="(value, key) in curNodeCrossLayer"
        :key="key"
        v-show="nodeDetailItems.includes(key)"
        :class="{ large: largeItems.includes(key) }"
      >
        <span class="item-title" :title="key">{{ key }} :</span>
        <span class="item-content" :title="value">{{ value }}</span>
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="js">
  import appIcon from './assets/APPLICATION.png';
  import middlewareIcon from './assets/MIDDLEWARE.png';
  import processIcon from './assets/PROCESS.png';
  import workloadIcon from './assets/WORKLOAD.png';
  import podIcon from './assets/POD.png';
  import nodeIcon from './assets/NODE.png';
  import eventIcon from './assets/EVENT_LIGHT.png';
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
      }
    },
    data() {
      return {
        smallTopoOption: {},
        nodeDetailItems: [
          'id',
          'name',
          'label',
          'state',
          'eventCount',
          'createTime',
          'updateTime',
          'podIp',
          'nodeIp',
          'hostName',
          'processNo',
          'middlewareType',
          'kind',
        ],
        largeItems: [
          'id',
          'name',
          'createTime',
          'updateTime'
        ],
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
      }
    },

    computed: {
      curNodeCrossLayer() {
        return this.$store.state.rocketTopo.curNodeCrossLayer;
      },
    },

    watch: {

    },

    mounted() {
      this.setSmallTopoOption();
    },

    methods: {
      setSmallTopoOption() {
        // const color1 = '#006acc';
        // const color2 = '#ff7d18';
        let categories = [
          {
            name: 'Current Node',
          },
          {
            name: 'Single Hop Nodes',
        }];

        // 点边初始化
        let nodes = [];
        let links = [];
        nodes.push({
          id: this.curNodeCrossLayer.id,
          name: this.curNodeCrossLayer.name,
          type: this.curNodeCrossLayer.type,
          state: this.curNodeCrossLayer.state,
          category: 0
        });
        this.topoViewData.links.forEach(link => {
          if (link.sid === this.curNodeCrossLayer.id) {
            links.push({
              id: link.id,
              name: link.name,
              type: link.type,
              source: link.sid,
              target: link.tid
            });
            nodes.push({
              id: link.target.id,
              name: link.target.name,
              type: link.target.type,
              state: link.target.state,
              category: 1
            });
          } else if (link.tid === this.curNodeCrossLayer.id) {
            links.push({
              id: link.id,
              name: link.name,
              type: link.type,
              source: link.sid,
              target: link.tid
            });
            nodes.push({
              id: link.source.id,
              name: link.source.name,
              type: link.source.type,
              state: link.source.state,
              category: 1
            });
          }
        });

        // 特别设置
        nodes.forEach(node => {
          if (node.category === 0) {
            node.symbolSize = 30;
          } else if (node.category === 1) {
            node.symbolSize = 20;
          }
          let nodeSymbol = 'image://' + appIcon + '';
          let nodeColor = '#fff';
          switch (node.type) {
            case 'Application':
              nodeSymbol = 'image://' + appIcon + '';
              nodeColor = this.pallet[0];
              break;
            case 'MiddleWare':
              nodeSymbol = 'image://' + middlewareIcon + '';
              nodeColor = this.pallet[1];
              break;
            case 'Process':
              nodeSymbol = 'image://' + processIcon + '';
              nodeColor = this.pallet[2];
              break;
            case 'Workload':
              nodeSymbol = 'image://' + workloadIcon + '';
              nodeColor = this.pallet[3];
              break;
            case 'Pod':
              nodeSymbol = 'image://' + podIcon + '';
              nodeColor = this.pallet[4];
              break;
            case 'Node':
              nodeSymbol = 'image://' + nodeIcon + '';
              nodeColor = this.pallet[5];
              break;
          }
          node.symbol = nodeSymbol;
          // node.itemStyle = {
          //   color: nodeColor
          // };
          node.label = {
            show: false,
            color: nodeColor,
            offset: [0, -17],
            borderColor: 'transparent',
            borderWith: 0,
            textBorderColor: 'transparent',
            textBorderWith: 0,
          };
          if (node.id === this.curNodeCrossLayer.id) {
            node.label.show = true;
            node.label.offset = [0, -22];
          }
        });
        links.forEach(link => {
          link.lineStyle = {
            color: 'rgba(33, 126, 242, 0.373)'
          };
          link.label = {
            show: true,
            position: 'middle',
            align: 'center',
            fontSize: 12,
            formatter: (params) => { // 高亮链路内容，待拓展
              return params.data.type;
            },
          };
        });

        // 设置点坐标
        nodes[0].value = [0, 0];
        if (nodes.length > 0) {
          let r = 50; // 动态适应视口？
          let detalAngle = (360 / (nodes.length - 1)).toFixed(2);
          for (let i = 1; i < nodes.length; i++) {
            let angle = detalAngle * i + 90;
            let x = (Math.cos(angle * Math.PI / 180)).toFixed(2) * r;
            let y = (Math.sin(angle * Math.PI / 180)).toFixed(2) * r;
            nodes[i].value = [x.toFixed(2), y.toFixed(2)];
          }
        }

        // 提取事件节点
        let eventNodes = [];
        nodes.forEach(node => {
          if (node.state === 'Abnormal') {
            let nodeObj = JSON.parse(JSON.stringify(node));
            nodeObj.symbol = 'image://' + eventIcon + '';
            nodeObj.symbolOffset = ['75%', '-75%'];
            nodeObj.name = '';
            if (nodeObj.id === this.curNodeCrossLayer.id) {
              nodeObj.label.show = false;
            }
            if (nodeObj.category === 0) {
              nodeObj.symbolSize = 24;
            } else if (nodeObj.category === 1) {
              nodeObj.symbolSize = 16;
            }
            eventNodes.push(nodeObj);
          }
        });

        this.smallTopoOption = {
          title: {
            show: true,
            text: 'single hop nodes :',
            left: '-5',
            top: '0',
            textStyle: {
              color: '#ccc',
              fontSize: 13,
              fontWeight: 'normal',
            }
          },
          xAxis: {
            show: false,
            type: "value",
            max: 50,
            min: -50,
          },
          yAxis: {
            show: false,
            type: "value",
            max: 50,
            min: -50,
          },
          // grid: {
          //   top: 50,
          //   bottom: 50,
          //   left: 50,
          //   right: 50,
          // },
          series: [{
            type: "graph",
            coordinateSystem: "cartesian2d",
            roam: true,
            focusNodeAdjacency: false,
            categories: categories,
            edgeSymbol: ['', 'arrow'],
            nodes: nodes,
            links: links,
          },
          {
            type: "graph",
            coordinateSystem: "cartesian2d",
            roam: true,
            focusNodeAdjacency: false,
            categories: categories,
            nodes: eventNodes,
          }]
        };
      },
      closeNodeDetail() {
        this.$emit('toggleNodeDetail', false);
        this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      }
    }
  }
</script>

<style lang="scss">
  .node-detail {
    width: 100%;
    height: 100%;
    position: relative;
    -webkit-transition: 0.5s width;
    transition: 0.5s width;

    .tvsl-close {
      position: absolute;
      top: 10px;
      right: 15px;
      z-index: 9999;

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

    .tvsl-small-topo {
      width: 100%;
      height: 50%;
      padding: 10px 20px 0px 20px;
    }

    .tvsl-node-info {
      width: 100%;
      height: 50%;
      padding: 0px 20px 10px 20px;

      .info-item {
        float: left;
        width: 30%;
        height: 30px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: #ccc;

        &.large {
          width: 100%;
        }

        .item-title {
          margin-right: 5px;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-content {
          flex-grow: 1;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .clear {
        display: none;
        clear: both;
      }
    }
  }
</style>