<template>
  <div class="topo-detail" ref="tdDom" v-show="!foldTopoDetail">
    <div
      class="td-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tdi-odd': index % 2 != 0, 'tdi-even': index % 2 == 0, 'tdi-select': item.id == selectNav }"
    >
      <div class="tdi-c"></div>
    </div>
    <div class="td-topo" ref="tdTopo">
      <div id="tdt-view-cross-layer">
        <!-- link text -->
        <div class="linkText" :style="linkTextPosition" v-show="linkTextVisible" v-text="linkTextContent"></div>
      </div>
      <div id="tdt-view-same-layer" v-if="showNodeDetail">
        <div class="tvsl-close">
          <span class="tvslc-icon" @click="closeNodeDetail"></span>
        </div>
        <div class="tvsl-small-topo">
          <RkEcharts :option="smallTopoOption" ref="smallTopo" />
        </div>
        <div class="tvsl-node-info">
          <!-- <div class="info-item"
            v-for="(value, key) in currentNode"
            :key="key">
            <span class="item-title" :title="key">{{key}} :</span>
            <span class="item-content" :title="vaule">{{value}}</span>
          </div> -->
          <div class="info-item">
            <span class="item-title" title="id">id :</span>
            <span class="item-content" :title="currentNode.id">{{ currentNode.id }}</span>
          </div>
          <div class="info-item">
            <span class="item-title" title="name">name :</span>
            <span class="item-content" :title="currentNode.name">{{ currentNode.name }}</span>
          </div>
          <div class="info-item">
            <span class="item-title" title="label">label :</span>
            <span class="item-content" :title="currentNode.type">{{ currentNode.type }}</span>
          </div>
          <div class="info-item">
            <span class="item-title" title="state">state :</span>
            <span class="item-content" :title="currentNode.state">{{ currentNode.state }}</span>
          </div>
          <div class="clear"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">

  import * as d3 from 'd3';
  import d3tip from 'd3-tip';
  import $jq from 'jquery';

  import appIcon from './assets/APP.png';
  import middlewareIcon from './assets/MIDDLEWARE.png';
  import processIcon from './assets/PROCESS.png';
  import deploymentIcon from './assets/DEPLOYMENT.png';
  import podIcon from './assets/POD.png';
  import nodeIcon from './assets/NODE.png';
  import eventIcon from './assets/EVENT.png';

  import icons from './chart/utils/icons';
  import tool from './chart/utils/tool';
  require('./assets/iconfont-topos/iconfont.js');

  export default {
    props: {
      topoData: {
        type: Object,
        default() {
          return {
            nodes: [],
            links: [],
          };
        },
      },
      foldTopoDetail: {
        type: Boolean,
        default: false
      },
      topoDetailData: {
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
        navList: [
          {
            id: 'App',
            name: 'Applications',
          },
          {
            id: 'Middleware',
            name: 'Middlewares',
          },
          {
            id: 'Process',
            name: 'Processes',
          },
          {
            id: 'Deployment',
            name: 'Deployments',
          },
          {
            id: 'Pod',
            name: 'Pods',
          },
          {
            id: 'Node',
            name: 'Nodes',
          }
        ],
        showNodeDetail: false,
        linkTextPosition: {
          left: 0,
          top: 0,
        },
        linkTextVisible: false,
        linkTextContent: '',
        smallTopoOption: {}
      }
    },

    computed: {
      selectNav() {
        return this.$store.state.rocketTopo.filterNodeType;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
    },

    watch: {
      topoDetailData(newVal, oldVal) {
        if (newVal.nodes.length > 0) {
          this.drawDetailTopoCrossLayer();
        }
      }
    },

    mounted() {
      this.drawDetailTopoCrossLayer();
      window.addEventListener('resize', this.resize);
    },

    methods: {
      setSmallTopoOption() {
        const color1 = '#006acc';
        const color2 = '#ff7d18';
        let categories = [
          {
            name: 'Current Node',
            itemStyle: {
                color: color1
            }
          },
          {
            name: 'Single Hop Nodes',
            itemStyle: {
                color: color2
            }
        }];

        // 点边初始化
        let nodes = [];
        let links = [];
        nodes.push({
          id: this.currentNode.id,
          name: this.currentNode.name,
          type: this.currentNode.type,
          category: 0,
          label: {
            show: true,
          }
        });
        this.topoData.links.forEach(link => {
          if (link.sid === this.currentNode.id) {
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
              category: 1
            });
          } else if (link.tid === this.currentNode.id) {
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
              category: 1
            });
          }
        });

        // 调色
        nodes.forEach(node => {
          if (node.category === 0) {
            node.symbolSize = 30;
            node.itemStyle = {
              color: color1
            };
          } else if (node.category === 1) {
            node.symbolSize = 20;
            node.itemStyle = {
              color: color2
            };
          }

        });
        links.forEach(link => {
          link.lineStyle = {
            color: link.type === 'tracingto' ? color1 : color2
          };
          link.emphasis = {
            label: {
              show: true,
              position: 'middle',
              align: 'center',
              fontSize: 12,
              formatter: (params) => { // 高亮链路内容，待拓展
                return params.data.type;
              },
            }
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
            focusNodeAdjacency: true,
            categories: categories,
            edgeSymbol: ['', 'arrow'],
            nodes: nodes,
            links: links
          }]
        };
      },
      handleSelectNav(itemId) {
        this.$store.commit('rocketTopo/SET_FILTER_NODE_TYPE', itemId);
      },
      drawDetailTopoCrossLayer() {
        if (this.topoDetailData.nodes.length <= 0) {
          return;
        }

        d3.select("#tdt-view-cross-layer svg").remove();

        const graph = this.topoDetailData;

        const topoHeight = this.$refs.tdTopo.clientHeight;
        const deltah = topoHeight / 6;
        const topoWidthMax = document.getElementById('tvccId').clientWidth;
        let deltaw = 50;

        // 计算拓扑宽度
        let appNum = 0;
        let middlewareNum = 0;
        let processNum = 0;
        let deploymentNum = 0;
        let podNum = 0;
        let nodeNum = 0;
        graph.nodes.forEach(node => {
          switch (node.type) {
            case 'App': appNum++; break;
            case 'Middleware': middlewareNum++; break;
            case 'Process': processNum++; break;
            case 'Deployment': deploymentNum++; break;
            case 'Pod': podNum++; break;
            case 'Node': nodeNum++; break;
            default: break;
          }
        });
        let maxNum = Math.max(appNum, middlewareNum, processNum, deploymentNum, podNum, nodeNum);
        let topoWidth = maxNum * deltaw + 20 > topoWidthMax ? topoWidthMax : maxNum * deltaw + 20;
        // 设置拓扑容器宽度 overflow:scroll-x？
        this.$refs.tdDom.style.width = topoWidth + 'px';

        // 计算节点间横向距离
        let appDeltaX =  (topoWidth - 20) / appNum;
        let middlewareDeltaX =  (topoWidth - 20) / middlewareNum;
        let processDeltaX =  (topoWidth - 20) / processNum;
        let deploymentDeltaX =  (topoWidth - 20) / deploymentNum;
        let podDeltaX =  (topoWidth - 20) / podNum;
        let nodeDeltaX =  (topoWidth - 20) / nodeNum;

        // 调整曲线
        let isAppLine2Src = appNum >= middlewareNum ? true : false;
        let isMiddlewareLine2Src = middlewareNum >= processNum ? true : false;
        let isProcessLine2Src = processNum >= deploymentNum ? true : false;
        let isDeploymentLine2Src = deploymentNum >= podNum ? true : false;
        let isPodLine2Src = podNum >= nodeNum ? true : false;

        appNum = 0;
        middlewareNum = 0;
        processNum = 0;
        deploymentNum = 0;
        podNum = 0;
        nodeNum = 0;

        const nodesOption = [];
        const linksOption = [];
        graph.nodes.forEach(node => {
          let itemTmp = {
            id: node.id,
            name: node.name,
            type: node.type,
            state: node.state,
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
            case 'Middleware': {
                middlewareNum++;
                itemTmp.x = (10 + middlewareDeltaX / 2) + (middlewareNum - 1) * middlewareDeltaX;
                itemTmp.y = 1.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + middlewareIcon + '';
              } break;
            case 'Process': {
                processNum++;
                itemTmp.x = (10 + processDeltaX / 2) + (processNum - 1) * processDeltaX;
                itemTmp.y = 2.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + processIcon + '';
              } break;
            case 'Deployment': {
                deploymentNum++;
                itemTmp.x = (10 + deploymentDeltaX / 2) + (deploymentNum - 1) * deploymentDeltaX;
                itemTmp.y = 3.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + deploymentIcon + '';
              } break;
            case 'Pod': {
                podNum++;
                itemTmp.x = (10 + podDeltaX / 2) + (podNum - 1) * podDeltaX;
                itemTmp.y = 4.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + podIcon + '';
              } break;
            case 'Node': {
                nodeNum++;
                itemTmp.x = (10 + nodeDeltaX / 2) + (nodeNum - 1) * nodeDeltaX;
                itemTmp.y = 5.5 * deltah;
                itemTmp.fx = itemTmp.x;
                itemTmp.fy = itemTmp.y;
                itemTmp.symbol = 'image://' + nodeIcon + '';
              } break;
            default: break;
          }
          nodesOption.push(itemTmp);
        });
        graph.links.forEach(link => {
          let itemTmp = {
            id: link.id,
            source: link.sid,
            target: link.tid,
            type: link.type
          };
          switch (link.source.type) {
            case 'App': itemTmp.isLine2Src = isAppLine2Src; break;
            case 'Middleware': itemTmp.isLine2Src = isMiddlewareLine2Src; break;
            case 'Process': itemTmp.isLine2Src = isProcessLine2Src; break;
            case 'Deployment': itemTmp.isLine2Src = isDeploymentLine2Src; break;
            case 'Pod': itemTmp.isLine2Src = isPodLine2Src; break;
            default: break;
          }
          linksOption.push(itemTmp);
        });

        const svg = d3
          .select('#tdt-view-cross-layer')
          .append('svg')
          .attr('class', 'topo-svg')
          .attr('height', this.$refs.tdTopo.clientHeight);

        // 设置提示
        let tip = d3tip()
          .attr('class', 'd3-tip')
          .offset([-8, 0]);
        svg.call(tip);

        function tick() {
          nodeEles.attr('transform', d => `translate(${d.fx}, ${d.fy})`);
          linkEles.attr('d', d => {
            if (d.isLine2Src) {
              return `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 - 45} ${d.target.fx} ${d.target.fy}`;
            }
            return `M ${d.source.fx} ${d.source.fy} Q ${(d.source.fx + d.target.fx) / 2} ${(d.source.fy + d.target.fy) / 2 + 45 } ${d.target.fx} ${d.target.fy}`;
          });
        };

        const force = d3
          .forceSimulation(nodesOption)
          .force("link", d3.forceLink(linksOption).id(d => d.id))
          .on("tick", tick);

        let nodeEles = svg.append('g').attr("class", "topo-nodes").selectAll('.topo-node');
        let linkEles = svg.append('g').attr("class", "topo-lines").selectAll('.topo-line');

        let shapeOption = {
          side: 3,
          centerRadius: 25,
          hexagonRadius: 10,
          fixAngle: Math.PI / 2,
          iconSize: 12,
        };
        let usedTool = tool(svg, [
          {icon: 'TRACE', click: this.handleGoNodeDetail},
          {icon: ''},
          {icon: ''},
        ], shapeOption);

        nodeEles = nodeEles.data(nodesOption)
          .enter().append("g")
          .attr("class", "topo-node");
        nodeEles.append('image')
          .attr('width', 28)
          .attr('height', 28)
          .attr('x', -14)
          .attr('y', -14)
          .attr('style', 'cursor: pointer;')
          .attr('xlink:href', d => icons[d.type.toUpperCase()])
          .on('mouseenter', (data, index, element) => {
            d3.event.stopPropagation();
            d3.event.preventDefault();

            // 处理点边重叠的情况
            $jq('.topo-line').addClass('tl-static');

            tip.html((data) => `<div>${data.name}</div>`).show(data, element[index]);
          })
          .on('mouseleave', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();

            $jq('.topo-line').removeClass('tl-static');

            tip.hide(this);
          })
          .on('click', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            usedTool.attr('transform', `translate(${d.x}, ${d.y})`).attr('style', 'display: block');
          });
        nodeEles.append('svg')
          .attr("class", "event-node-cross-topo")
          .attr('width', 18)
          .attr('height', 18)
          .attr('x', 5)
          .attr('y', -25)
          .append('use')
          .attr('xlink:href', d => d.state === 'Event' ? '#icon-jingbaoxinxi-' : '');

        linkEles = linkEles.data(linksOption)
          .enter().append("path")
          .attr("class", "topo-line")
          .on('mouseover', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            let offsetX = $jq('#tdt-view-cross-layer').offset().left;
            let offsetY = $jq('#tdt-view-cross-layer').offset().top;
            this.linkTextPosition = {
              left: d3.event.clientX - offsetX + 10 + 'px',
              top: d3.event.clientY - offsetY - 25 + 'px',
            };
            this.linkTextContent = d.type;
            this.linkTextVisible = true;
          })
          .on('mouseout', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            this.linkTextVisible = false;
            this.linkTextContent = '';
            this.linkTextPosition = {
              left: 0 + 'px',
              top: 0 + 'px',
            };
          })
          .style("stroke", "#217EF25f");

        svg.on('click', (d, i) => {
          d3.event.stopPropagation();
          d3.event.preventDefault();
          usedTool.attr('style', 'display: none');
        });

      },
      handleGoNodeDetail() {
        event.stopPropagation();
        event.preventDefault();
        this.setSmallTopoOption();
        this.showNodeDetail = true;
      },
      closeNodeDetail() {
        event.stopPropagation();
        event.preventDefault();
        this.showNodeDetail = false;
      },
      resize() {
        this.drawDetailTopoCrossLayer();
      },
    }
  }
</script>

<style lang="scss">
  .topo-detail {
    height: 100%;
    -webkit-transition: all 0.5s;
    transition: all 0.5s;

    .td-item {
      width: 100%;
      height: 16.66%;
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
        position: relative;

        .linkText {
          position: absolute;
          z-index: 999;
          background-color: rgba(75, 75, 75, 0.596);
          border-radius: 2px;
          color: white;
          padding: 2px;
        }

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

          .tl-static {
            pointer-events: none;
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
        width: 600px;
        background-color: #252a2f;
        z-index: 999;
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
            width: 33.33%;
            height: 50px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            color: #ccc;

            .item-title {
              // width: 50%;
              margin-right: 8px;
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
