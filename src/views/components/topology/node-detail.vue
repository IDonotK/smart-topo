<template>
  <div id="tdt-view-node-detail" class="node-detail">
    <div class="tvsl-close">
      <span class="tvslc-icon" @click="closeNodeDetail"></span>
    </div>
    <div class="tvsl-small-topo">
      <RkEcharts ref="smallTopo" :option="smallTopoOption" :clickEvent="handleClickTopo" />
    </div>
    <div class="tvsl-node-info">
      <div
        v-for="(value, key) in curNodeCrossLayer"
        v-show="largeDetailItems.includes(key)"
        :key="'large' + key"
        :class="{ 'info-item': true, large: largeDetailItems.includes(key) }"
      >
        <span class="item-title" :title="key">{{ key }} :</span>
        <span class="item-content" :title="value">{{ value }}</span>
      </div>
      <div
        v-for="(item, index) in smallDetailItems"
        v-show="curNodeCrossLayer.hasOwnProperty(item)"
        :key="'small' + index"
        :class="{ 'info-item': true, 'small': true }"
      >
        <span class="item-title" :title="item"
          >{{ item }}
          <el-tooltip
            v-if="item === 'eventLevel'"
            class="item"
            effect="light"
            :content="$t('nodeDetail_eventLevel_help')"
            placement="top"
          >
            <svg class="icon sm vm help-icon">
              <use xlink:href="#HELP"></use>
            </svg>
          </el-tooltip>
          :
        </span>
        <span class="item-content" :title="curNodeCrossLayer[item]">{{ curNodeCrossLayer[item] }}</span>
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="js">
import { getIconByName } from './utils/icons';
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
      largeDetailItems: [
        'id',
        'name',
        'createTime',
        'updateTime',
        'hostName'
      ],
      smallDetailItems: [
        'label',
        'podIp',
        'nodeIp',
        'processNo',
        'middleWareType',
        'kind',
        'eventLevel',
        'eventCount',
        'state'
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
      tooltipStyle: '',
    }
  },

  computed: {
    curNodeCrossLayer() {
      return this.$store.state.rocketTopo.curNodeCrossLayer;
    },
  },

  mounted() {
    this.tooltipStyle = `
      background-color: transparent;
      width: 500px;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-all;
    `;
    this.setSmallTopoOption();
  },

  methods: {
    handleClickTopo(clickedObj) {
      if (clickedObj && clickedObj.data && clickedObj.data.id) {
        this.$store.commit('rocketTopo/SET_VIEW_NODE', clickedObj.data);
      }
    },
    setSeries(nodes, links, eventNodes, categories) {
      let series = [{
        type: 'graph',
        coordinateSystem: 'cartesian2d',
        roam: true,
        focusNodeAdjacency: false,
        categories,
        edgeSymbol: ['', 'arrow'],
        emphasis: {
          label: {
            show: false,
          },
        },
        nodes,
        links,
      },
      {
        type: 'graph',
        coordinateSystem: 'cartesian2d',
        roam: true,
        focusNodeAdjacency: false,
        categories,
        nodes: eventNodes,
      }];
      return series;
    },
    setOption(nodes, links, eventNodes, categories) {
      let seriesOption = this.setSeries(nodes, links, eventNodes, categories);
      this.smallTopoOption = {
        title: {
          show: true,
          text: this.$t('nodeDetail_singleHopNodes_title'),
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
          type: 'value',
          max: 50,
          min: -50,
        },
        yAxis: {
          show: false,
          type: 'value',
          max: 50,
          min: -50,
        },
        tooltip: {
          show: true,
          trigger: 'item',
          showContent: true,
          transitionDuration: 0,
          triggerOn: 'mousemove',
          textStyle: {
            overflow: 'breakAll',
          },
          extraCssText: `${this.tooltipStyle}text-align: left;`,
        },
        series: seriesOption,
      };
    },
    setTopoEventNodes(nodes, eventNodes) {
      nodes.forEach(node => {
        if (node.eventCount > 0) {
          let nodeObj = JSON.parse(JSON.stringify(node));
          let eventIcon = '';
          switch (node.eventLevel) {
            case 'Critical': eventIcon = getIconByName('EVENT_CRITICAL'); break;
            case 'Warning': eventIcon = getIconByName('EVENT_WARNING'); break;
            default: break;
          }
          nodeObj.symbol = `image://${  eventIcon}`;
          nodeObj.name = '';
          if (nodeObj.category === 0) {
            nodeObj.symbolOffset = [16, -20];
            nodeObj.symbolSize = 20;
          } else if (nodeObj.category === 1) {
            nodeObj.symbolOffset = [12, -14];
            nodeObj.symbolSize = 14;
          }
          nodeObj.tooltip = {
            formatter: (dataArr) => '',
          };
          eventNodes.push(nodeObj);
        }
      });
    },
    handleTopoLinksSpecially(links) {
      links.forEach(link => {
        link.lineStyle = {
          color: 'rgba(33, 126, 242, 0.373)'
        };
        link.label = {
          show: true,
          position: 'middle',
          align: 'center',
          fontSize: 12,
          formatter: (params) =>  // 高亮链路内容，待拓展
             params.data.type
          ,
        };
        link.tooltip = {
          formatter: (dataArr) => '',
        }
      });
    },
    handleTopoNodesSpecially(nodes) {
      nodes.forEach(node => {
        node.symbolSize = node.category === 0 ? 30 : 20;
        let nodeSymbol = `image://${ getIconByName(node.type) }`;
        let nodeColor = '#fff';
        switch (node.type) {
          case 'Application':
            nodeColor = this.pallet[0];
            break;
          case 'MiddleWare':
            {
              let middleWareTypes = ['Cache', 'Database', 'MQ'];
              let name = middleWareTypes.includes(node.middleWareType) ? `${node.type  }_${  node.middleWareType}` : node.type;
              nodeSymbol = `image://${  getIconByName(name)}`;
              nodeColor = this.pallet[1];
            }
            break;
          case 'Process':
            nodeColor = this.pallet[2];
            break;
          case 'Pod':
            nodeColor = this.pallet[3];
            break;
          case 'Node':
            nodeColor = this.pallet[4];
            break;
          default: break;
        }
        node.symbol = nodeSymbol;
        node.tooltip = {
          formatter: (dataArr) => {
            if (dataArr && dataArr.data && dataArr.data.shortName) {
              return dataArr.data.shortName;
            }
            return '';
          },
          position: (point) => [point[0] + 5, point[1] + 5],
        };
        if (parseFloat(node.value[0]) > 0) {
          node.tooltip.position = (point) => [point[0] - 505, point[1] + 5];
          node.tooltip.extraCssText = `${this.tooltipStyle}text-align: right;`;
        }
      });
    },
    setTopoNodesCoord(nodes) {
      nodes[0].value = [0, 0];
      if (nodes.length > 1) {
        let r = 50; // 动态适应视口？
        let detalAngle = (360 / (nodes.length - 1)).toFixed(2);
        for (let i = 1; i < nodes.length; i++) {
          let angle = detalAngle * i + 90;
          let x = (Math.cos(angle * Math.PI / 180)).toFixed(2) * r;
          let y = (Math.sin(angle * Math.PI / 180)).toFixed(2) * r;
          nodes[i].value = [x.toFixed(2), y.toFixed(2)];
        }
      }
    },
    setSmallTopoData(nodes, links) {
      nodes.push({
        id: this.curNodeCrossLayer.id,
        name: this.curNodeCrossLayer.name,
        shortName: this.curNodeCrossLayer.shortName,
        type: this.curNodeCrossLayer.type,
        state: this.curNodeCrossLayer.state,
        eventCount: this.curNodeCrossLayer.eventCount,
        eventLevel: this.curNodeCrossLayer.eventLevel,
        middleWareType: this.curNodeCrossLayer.middleWareType,
        category: 0
      });
      this.topoViewData.links.forEach(link => {
        if (link.sid === this.curNodeCrossLayer.id || link.tid === this.curNodeCrossLayer.id) {
          links.push({
            id: link.id,
            name: link.name,
            type: link.type,
            source: link.sid,
            target: link.tid
          });
        }
        if (link.sid === this.curNodeCrossLayer.id) {
          nodes.push({
            id: link.target.id,
            name: link.target.name,
            shortName: link.target.shortName,
            type: link.target.type,
            state: link.target.state,
            eventCount: link.target.eventCount,
            eventLevel: link.target.eventLevel,
            middleWareType: link.target.middleWareType,
            category: 1
          });
        } else if (link.tid === this.curNodeCrossLayer.id) {
          nodes.push({
            id: link.source.id,
            name: link.source.name,
            shortName: link.source.shortName,
            type: link.source.type,
            state: link.source.state,
            eventCount: link.source.eventCount,
            eventLevel: link.source.eventLevel,
            middleWareType: link.source.middleWareType,
            category: 1
          });
        }
      });
    },
    setSmallTopoOption() {
      let categories = [ { name: 'Current Node' }, { name: 'Single Hop Node' }];
      let nodes = [];
      let links = [];
      this.setSmallTopoData(nodes, links);
      this.setTopoNodesCoord(nodes);
      this.handleTopoNodesSpecially(nodes);
      this.handleTopoLinksSpecially(links);
      let eventNodes = [];
      this.setTopoEventNodes(nodes, eventNodes);
      this.setOption(nodes, links, eventNodes, categories);
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
        padding: 10px 20px 0 20px;
    }

    .tvsl-node-info {
        width: 100%;
        height: 50%;
        padding: 0 20px 10px 20px;

        .info-item {
            float: left;
            height: 30px;
            color: #ccc;
            display: flex;

            &.large {
                width: 100%;
            }

            &.small {
                width: 30%;
            }

            .item-title {
                margin-right: 5px;
                text-align: left;
                white-space: nowrap;

                .help-icon {
                    width: 15px;
                    height: 15px;

                    &:hover {
                        cursor: pointer;
                    }
                }
            }

            .item-content {
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
