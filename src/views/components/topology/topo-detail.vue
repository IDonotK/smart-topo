<template>
  <div id="tdId" class="topo-detail" ref="tdDom">
    <!-- 背景调色 -->
    <div
      class="td-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tdi-odd': index % 2 != 0, 'tdi-even': index % 2 == 0, 'tdi-select': item.id == currentNode.type }"
    >
      <div class="tdi-c"></div>
    </div>
    <div id="tdtId" class="td-topo" ref="tdTopo">
      <!-- 节点纵向依赖 -->
      <div id="tdt-view-cross-layer">
        <!-- link text -->
        <div class="linkText" :style="linkTextPosition" v-show="linkTextVisible" v-text="linkTextContent"></div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  import * as d3 from 'd3';
  import d3tip from 'd3-tip';
  import $jq from 'jquery';

  import appIcon from './assets/APPLICATION.png';
  import middlewareIcon from './assets/MIDDLEWARE.png';
  import processIcon from './assets/PROCESS.png';
  import workloadIcon from './assets/WORKLOAD.png';
  import podIcon from './assets/POD.png';
  import nodeIcon from './assets/NODE.png';
  import eventIcon from './assets/EVENT_LIGHT.png';

  import icons from './chart/utils/icons';
  import tool from './chart/utils/tool';
  require('./assets/iconfont-topos/iconfont.js');

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
      },
    },
    data() {
      return {
        navList: [
          {
            id: 'Application',
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
            id: 'Workload',
            name: 'Workloads',
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
        linkTextPosition: {
          left: 0,
          top: 0,
        },
        linkTextVisible: false,
        linkTextContent: '',
        nodeSingleClickTimer: null,
        usedTool: null,
      }
    },

    computed: {
      topoDetailData() {
        return this.$store.state.rocketTopo.topoDetailData;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
    },

    watch: {
      topoDetailData(newVal) {
        this.drawDetailTopoCrossLayer();
      }
    },

    mounted() {
      this.drawDetailTopoCrossLayer();
      window.addEventListener('resize', this.resize);
    },

    methods: {
      setCurNodeStably(curNode) {
        let lastX = curNode.x;
        let lastY = curNode.y;
        let staticNum = 0;
        let tickTimer = setInterval(() => {
          if (parseInt(curNode.x) === parseInt(lastX) && parseInt(curNode.y) === parseInt(lastY)) { // 可放宽限制，加快速度
            staticNum++;
          } else {
            lastX = curNode.x;
            lastY = curNode.y;
            staticNum = 0;
          }
          if (staticNum > 10) {
            clearTimeout(tickTimer);
            this.$store.commit('rocketTopo/SET_NODE', curNode);
          }
        }, 10);
      },
      drawDetailTopoCrossLayer() {
        d3.select("#tdt-view-cross-layer svg").remove();

        if (this.tip) {
          this.tip.hide(this);
          this.tip = null;
        }
        if (this.usedTool) {
          this.usedTool.attr('style', 'display: none');
          this.usedTool = null;
        }
        this.linkTextVisible = false;
        this.linkTextContent = '';
        this.linkTextPosition = {
          left: 0 + 'px',
          top: 0 + 'px',
        };

        // console.log("topoDetailData: ", this.topoDetailData);

        if (this.topoDetailData.nodes.length <= 0) {
          return;
        }

        const graph = this.topoDetailData;

        const topoHeight = $jq("#tdtId").height();
        const deltah = topoHeight / 6;
        // #tdw最大宽度为主拓扑视口#tvcc的一半
        const tdwWidthMax = document.getElementById('tvccId').clientWidth * 0.6;
        const deltaw = 50;

        // 计算拓扑宽度
        let appNum = 0;
        let middlewareNum = 0;
        let processNum = 0;
        let workloadNum = 0;
        let podNum = 0;
        let nodeNum = 0;
        graph.nodes.forEach(node => {
          switch (node.type) {
            case 'Application': appNum++; break;
            case 'Middleware': middlewareNum++; break;
            case 'Process': processNum++; break;
            case 'Workload': workloadNum++; break;
            case 'Pod': podNum++; break;
            case 'Node': nodeNum++; break;
            default: break;
          }
        });
        // 选中节点类型 偶补成奇
        let curTypeNum = 0;
        switch (this.currentNode.type) {
          case 'Application': appNum = (appNum % 2 === 0 ? appNum + 1 : appNum); curTypeNum = appNum; break;
          case 'Middleware': middlewareNum = (middlewareNum % 2 === 0 ? middlewareNum + 1 : middlewareNum); curTypeNum = middlewareNum; break;
          case 'Process': processNum = (processNum % 2 === 0 ? processNum + 1 : processNum); curTypeNum = processNum; break;
          case 'Workload': workloadNum = (workloadNum % 2 === 0 ? workloadNum + 1 : workloadNum); curTypeNum = workloadNum; break;
          case 'Pod': podNum = (podNum % 2 === 0 ? podNum + 1 : podNum); curTypeNum = podNum; break;
          case 'Node': nodeNum = (nodeNum % 2 === 0 ? nodeNum + 1 : nodeNum); curTypeNum = nodeNum; break;
          default: break;
        }
        let maxNum = Math.max(appNum, middlewareNum, processNum, workloadNum, podNum, nodeNum);
        let topoWidth = 50 + maxNum * deltaw + 50;
        let tdwWidth = topoWidth > tdwWidthMax ? tdwWidthMax : topoWidth;
        // 设置tvcl宽度
        $jq('#tdwId').width(tdwWidth);
        // 设置topoDetail宽度
        $jq('#tdId').width(topoWidth);

        // 计算起点坐标
        let appStartX = 50 + (maxNum - appNum) / 2 * 50;
        let middlewareStartX = 50 + (maxNum - middlewareNum) / 2 * 50;
        let processStartX = 50 + (maxNum - processNum) / 2 * 50;
        let workloadStartX = 50 + (maxNum - workloadNum) / 2 * 50;
        let podStartX = 50 + (maxNum - podNum) / 2 * 50;
        let nodeStartX = 50 + (maxNum - nodeNum) / 2 * 50;

        // 调整曲线
        let isAppLine2Src = appNum >= middlewareNum ? true : false;
        let isMiddlewareLine2Src = middlewareNum >= processNum ? true : false;
        let isProcessLine2Src = processNum >= workloadNum ? true : false;
        let isWorkloadLine2Src = workloadNum >= podNum ? true : false;
        let isPodLine2Src = podNum >= nodeNum ? true : false;

        appNum = 0;
        middlewareNum = 0;
        processNum = 0;
        workloadNum = 0;
        podNum = 0;
        nodeNum = 0;

        const nodesOption = [];
        const linksOption = [];
        // 计算节点坐标
        function setNodePositonNormalLayer(nNum, nObj, startX, factorY, nIcon, nSize) {
          nObj.x = startX + (nNum - 1) * deltaw;
          nObj.y = factorY * deltah;
          nObj.fx = nObj.x;
          nObj.fy = nObj.y;
          nObj.symbol = 'image://' + nIcon + '';
          nObj.symbolSize = nSize;
        }
        function setNodePositonCurNodeLayer(nNum, cNum, nObj, startX, factorY, nIcon, nSize) {
          if (nNum === 1) { // 选中节点居中
            setNodePositonNormalLayer((cNum + 1) / 2, nObj, startX, factorY, nIcon, nSize);
          } else if (nNum > 1 && nNum <= (cNum + 1) / 2) {
            setNodePositonNormalLayer(nNum - 1, nObj, startX, factorY, nIcon, nSize - 8);
          } else if (nNum > (cNum + 1) / 2) {
            setNodePositonNormalLayer(nNum, nObj, startX, factorY, nIcon, nSize - 8);
          }
        }
        graph.nodes.forEach(node => {
          let itemTmp = {
            id: node.id,
            name: node.name,
            type: node.type,
            state: node.state,
          };
          switch (node.type) {
            case 'Application': {
                appNum++;
                if (this.currentNode.type === 'Application') {
                  setNodePositonCurNodeLayer(appNum, curTypeNum, itemTmp, appStartX, 0.5, appIcon, 28);
                } else {
                  setNodePositonNormalLayer(appNum, itemTmp, appStartX, 0.5, appIcon, 28);
                }
              } break;
            case 'Middleware': {
                middlewareNum++;
                if (this.currentNode.type === 'Middleware') {
                  setNodePositonCurNodeLayer(middlewareNum, curTypeNum, itemTmp, middlewareStartX, 1.5, middlewareIcon, 28);
                } else {
                  setNodePositonNormalLayer(middlewareNum, itemTmp, middlewareStartX, 1.5, middlewareIcon, 28);
                }
              } break;
            case 'Process': {
                processNum++;
                if (this.currentNode.type === 'Process') {
                  setNodePositonCurNodeLayer(processNum, curTypeNum, itemTmp, processStartX, 2.5, processIcon, 28);
                } else {
                  setNodePositonNormalLayer(processNum, itemTmp, processStartX, 2.5, processIcon, 28);
                }
              } break;
            case 'Workload': {
                workloadNum++;
                if (this.currentNode.type === 'Workload') {
                  setNodePositonCurNodeLayer(workloadNum, curTypeNum, itemTmp, workloadStartX, 3.5, workloadIcon, 28);
                } else {
                  setNodePositonNormalLayer(workloadNum, itemTmp, workloadStartX, 3.5, workloadIcon, 28);
                }
              } break;
            case 'Pod': {
                podNum++;
                if (this.currentNode.type === 'Pod') {
                  setNodePositonCurNodeLayer(podNum, curTypeNum, itemTmp, podStartX, 4.5, podIcon, 28);
                } else {
                  setNodePositonNormalLayer(podNum, itemTmp, podStartX, 4.5, podIcon, 28);
                }
              } break;
            case 'Node': {
                nodeNum++;
                if (this.currentNode.type === 'Node') {
                  setNodePositonCurNodeLayer(nodeNum, curTypeNum, itemTmp, nodeStartX, 5.5, nodeIcon, 28);
                } else {
                  setNodePositonNormalLayer(nodeNum, itemTmp, nodeStartX, 5.5, nodeIcon, 28);
                }
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
            type: link.type,
            isTracingTo: (link.type === 'TracingTo' || link.type === 'SubTracingTo')? true : false,
          };
          switch (link.source.type) {
            case 'Application': itemTmp.isLine2Src = isAppLine2Src; break;
            case 'Middleware': itemTmp.isLine2Src = isMiddlewareLine2Src; break;
            case 'Process': itemTmp.isLine2Src = isProcessLine2Src; break;
            case 'Workload': itemTmp.isLine2Src = isWorkloadLine2Src; break;
            case 'Pod': itemTmp.isLine2Src = isPodLine2Src; break;
            default: break;
          }
          linksOption.push(itemTmp);
        });

        const svg = d3
          .select('#tdt-view-cross-layer')
          .append('svg')
          .attr('class', 'topo-svg')
          .attr('height', topoHeight);

        // 设置提示
        this.tip = d3tip()
          .attr('class', 'd3-tip')
          .offset([-8, 0]);
        svg.call(this.tip);

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
          fixAngle: Math.PI / 6,
          iconSize: 12,
        };
        this.usedTool = tool(svg, [
          {icon: 'NODEDETAIL', click: this.handleGoNodeDetail},
          {icon: ''},
          {icon: ''},
        ], shapeOption);

        nodeEles = nodeEles.data(nodesOption)
          .enter().append("g")
          .attr("class", "topo-node");
        nodeEles.append('image')
          .attr('width', d => d.symbolSize)
          .attr('height', d => d.symbolSize)
          .attr('x', d => -d.symbolSize / 2)
          .attr('y', d => -d.symbolSize / 2)
          .attr('style', 'cursor: pointer;')
          .attr('xlink:href', d => icons[d.type.toUpperCase()])
          .on('mouseenter', (data, index, element) => {
            d3.event.stopPropagation();
            d3.event.preventDefault();

            // 处理点边重叠的情况
            $jq('.topo-line').addClass('tl-static');

            this.tip.html((data) => `<div>${data.name}</div>`).show(data, element[index]);
          })
          .on('mouseleave', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            $jq('.topo-line').removeClass('tl-static');
            this.tip.hide(this);
          })
          .on('click', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            this.$emit('toggleNodeDetail', false);
            this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
            if (this.nodeSingleClickTimer !== null) {
              clearTimeout(this.nodeSingleClickTimer);
              this.nodeSingleClickTimer = null;
              return;
            }
            this.nodeSingleClickTimer = setTimeout(() => {
              this.nodeSingleClickTimer = null;
              this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', d);
              this.usedTool
                .attr('transform', `translate(${d.x}, ${d.y})`)
                .attr('style', 'display: block');
            }, 300);
          })
          .on('dblclick', d => {
            d3.event.stopPropagation();
            d3.event.preventDefault();
            this.$emit('toggleNodeDetail', false);
            this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
            $jq('.topo-line').removeClass('tl-static');
            this.tip.hide(this);
            this.usedTool.attr('style', 'display: none');
            this.handleNodeDblclicked(d);
          });
        nodeEles.append('svg')
          .attr("class", "event-node-cross-topo")
          .attr('width', d => d.symbolSize === 28 ? 18 : 12)
          .attr('height', d => d.symbolSize === 28 ? 18 : 12)
          .attr('x', d => d.symbolSize === 28 ? 5 : 3)
          .attr('y', d => d.symbolSize === 28 ? -25 : -18)
          .append('use')
          .attr('xlink:href', d => d.state === 'Abnormal' ? '#icon-tanhao' : '');

        linkEles = linkEles.data(linksOption)
          .enter().append("path")
          .attr("class", "topo-line")
          .attr("stroke-dasharray", d => d.isTracingTo ? '13 7' : 'none')
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
          this.$emit('toggleNodeDetail', false);
          this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
          this.usedTool.attr('style', 'display: none');
        });

      },
      handleNodeDblclicked(nodeTmp) {
        if (nodeTmp.id === this.currentNode.id) {
          return;
        }
        let node = this.topoViewData.nodes.find(node => node.id === nodeTmp.id); // 对应主拓扑的节点对象
        this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
        this.setCurNodeStably(node);
        // this.$store.commit('rocketTopo/SET_NODE', node);
      },
      handleGoNodeDetail() {
        event.stopPropagation();
        event.preventDefault();
        this.usedTool.attr('style', 'display: none');
        this.$emit('toggleNodeDetail', true);
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
    position: relative;

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
