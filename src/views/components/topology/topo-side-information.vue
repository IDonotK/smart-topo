<template>
  <div class="topo-side-info">
    <overlay-scrollbars
      v-show="topoViewData.nodes.length > 0 && !isLoadingTopo"
      style="height: 100%;"
      :options="scrollOptions"
    >
      <!-- 拓扑标题 -->
      <div v-show="topoViewData.nodes.length > 0" class="topo-info">
        <div class="mti-item topo-mode">
          <span class="title">{{ $t('topoSideInformation_topoInfo_mode') }}</span>
          <span v-if="topoMode === 'global'" class="content">{{
            $t('topoSideInformation_topoInfo_mode_global')
          }}</span>
          <span v-else class="content"
            >{{ $t('topoSideInformation_topoInfo_mode_specific') }}({{ exploreNode.id }})</span
          >
        </div>
        <div class="mti-item show-node-type">
          <span class="title">{{ $t('topoSideInformation_topoInfo_node_type') }}</span>
          <ul class="content">
            <li v-for="(showNodeType, index) in showNodeTypes" :key="'type' + index">{{ showNodeType }}</li>
          </ul>
        </div>
        <div class="mti-item node-state-type">
          <span class="title">{{ $t('topoSideInformation_topoInfo_node_state') }}</span>
          <span class="content">{{ showStateTypes.join(', ') }}</span>
        </div>
        <div v-show="currentNode.id !== undefined" class="mti-item current-node">
          <span class="title">{{ $t('topoSideInformation_topoInfo_node_selected') }}</span>
          <span class="content">{{ currentNode.name }}</span>
        </div>
        <div v-show="currentNode.id !== undefined" class="mti-item relative-node-type">
          <span class="title">{{ $t('topoSideInformation_topoInfo_node_relation') }}</span>
          <span class="content">{{ showRelativeTypes.join(', ') }}</span>
        </div>
        <!-- 查看节点详情 -->
        <div v-show="viewNode.id !== undefined" class="view-node-info">
          <div class="info-title">{{ $t('topoSideInformation_nodeInfo_node_checked') }}</div>
          <div
            v-for="(item, index) in nodeDetailItems"
            v-show="viewNode.hasOwnProperty(item)"
            :key="'field' + index"
            class="info-item"
          >
            <span class="item-title"
              >{{ item }}
              <el-tooltip
                v-if="item === 'eventLevel'"
                class="item-btn"
                effect="light"
                :content="$t('nodeDetail_eventLevel_help')"
                placement="top"
              >
                <svg class="icon sm vm help-icon">
                  <use xlink:href="#HELP"></use>
                </svg>
              </el-tooltip>
              :</span
            >
            <span v-if="item === 'id'" class="item-content">
              <span :title="viewNode[item]">{{ viewNode[item] }}</span>
              <!-- 复制按钮 -->
              <span class="item-btn" :title="$t('copy')" @click.prevent.stop="copyNodeId(viewNode[item])">
                <svg class="icon sm vm copy-btn-icon">
                  <use xlink:href="#COPY_GRAY"></use>
                </svg>
              </span>
            </span>
            <ul v-else-if="item.indexOf('Time') !== -1" class="item-content" :title="viewNode[item]">
              <li>{{ viewNode[item] && viewNode[item].slice(0, viewNode[item].indexOf(' ')) }}</li>
              <li>{{ viewNode[item] && viewNode[item].slice(viewNode[item].indexOf(' ')) }}</li>
            </ul>
            <span v-else class="item-content">
              <span :title="viewNode[item]">{{ viewNode[item] }}</span>
              <!-- 查看事件按钮 -->
              <span
                v-if="item === 'eventCount'"
                class="item-btn"
                :title="$t('topoSideInformation_nodeInfo_check_event')"
                @click.prevent.stop="showEvents"
              >
                <svg class="icon sm vm event-btn-icon">
                  <use xlink:href="#DETAIL_PAGE_GRAY"></use>
                </svg>
              </span>
            </span>
          </div>
        </div>
      </div>
    </overlay-scrollbars>
    <!-- 查看事件列表 -->
    <el-drawer
      class="events-drawer"
      :title="$t('topoSideInformation_nodeInfo_event_list')"
      :visible.sync="isShowEvents"
      direction="rtl"
      size="880px"
    >
      <node-events v-if="isShowEvents" :viewNodeId="viewNode.id" />
    </el-drawer>
    <!-- 加载过程样式 -->
    <div v-show="isLoadingTopo" class="topo-info-loading">
      <svg class="icon loading">
        <use xlink:href="#spinner-light"></use>
      </svg>
    </div>
    <!-- 加载结果为空样式 -->
    <div v-show="topoViewData.nodes.length === 0 && !isLoadingTopo" class="topo-info-empty">
      {{ $t('noData') }}
    </div>
  </div>
</template>

<script lang="js">
import NodeEvents from './node-events.vue';

export default {

  components: {
    NodeEvents,
  },
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
      scrollOptions: {
        className: 'os-theme-light',
        resize: 'none',
        sizeAutoCapable : true,
        paddingAbsolute : true,
        scrollbars : {
          clickScrolling : true,
          dragScrolling: true,
        },
      },
      nodeDetailItems: [
        'id',
        'name',
        'label',
        'podIp',
        'nodeIp',
        'hostName',
        'processNo',
        'middleWareType',
        'kind',
        'eventLevel',
        'eventCount',
        'state',
        'createTime',
        'updateTime',
      ],
      isShowEvents: false,
    }
  },

  computed: {
    isLoadingTopo() {
      return this.$store.state.rocketTopo.isLoadingTopo;
    },
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    showNodeTypes() { // 左侧栏显示点类型过滤
      return this.$store.state.rocketTopo.showNodeTypes;
    },
    showStateTypes() { // 右上角点状态类型过滤
      return this.$store.state.rocketTopo.showStateTypes;
    },
    showEdgeTypes() { // 右上角显示边类型过滤
      return this.$store.state.rocketTopo.showEdgeTypes;
    },
    showRelativeTypes() { // 右上角关联点类型过滤
      return this.$store.state.rocketTopo.showRelativeTypes;
    },
    exploreNode() {
      return this.$store.state.rocketTopo.exploreNode;
    },
    viewNode() { // 当前查看节点
      return this.$store.state.rocketTopo.viewNode;
    },
    currentNode() {
      return this.$store.state.rocketTopo.currentNode;
    },
  },

  watch: {},

  mounted() {
  },

  methods: {
    copyNodeId(id) {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.setAttribute('value', id);
      input.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      document.body.removeChild(input);
    },
    showEvents() {
      this.isShowEvents = true;
    },
  },
}
</script>

<style lang="scss">
.topo-side-info {
    position: absolute;
    right: 0;
    top: 2px;
    bottom: 2px;
    width: 260px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    background-color: #242424;

    .topo-info {
        $titleWidth: 118px;

        padding: 10px;
        color: #ccc;

        .mti-item {
            padding: 3px 0;
            text-align: left;
            display: flex;
            flex-direction: row;

            .title {
                flex: 0 0 $titleWidth;
                opacity: 0.8;
            }

            .content {
                word-break: break-all;
            }
        }

        .view-node-info {
            margin-top: 20px;

            .info-title {
                color: deepskyblue;
            }

            .info-item {
                padding: 3px 0;
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                color: #ccc;

                .item-title {
                    flex: 0 0 $titleWidth;
                    opacity: 0.8;
                    text-align: left;
                    overflow: hidden;
                    text-overflow: ellipsis;
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
                    word-break: break-all;

                    &.item-content-ellipsis {
                        text-align: left;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .item-btn {
                        color: #ddd;
                        font-size: 10px;
                        cursor: pointer;
                        pointer-events: all;
                        position: relative;
                        top: -2px;

                        .copy-btn-icon {
                            width: 20px;
                            height: 20px;
                        }

                        .event-btn-icon {
                            width: 22px;
                            height: 22px;
                        }

                        &:active {
                            color: rgb(63, 177, 227);
                        }
                    }
                }
            }
        }
    }

    .events-drawer {
        /deep/ :focus {
            outline: 0;
        }

        .el-drawer {
            overflow-y: auto !important;
            background-color: #252a2f;

            .el-drawer__header {
                text-align: left;
                color: #ddd;
                font-size: 16px;
                font-weight: 500;
            }
        }

        .el-drawer__body {
            padding: 0 20px;
        }

        .table-wrapper {
            width: 100%;
            overflow: hidden;
            border-right: solid 1px #ebeef5;

            .events-table {
                margin-left: 2px;

                .cell {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .el-table__expanded-cell {
                    padding: 20px 20px !important;

                    .el-form-item__content {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }

                .events-table-expand {
                    font-size: 0;
                }

                .events-table-expand label {
                    width: 90px;
                    color: #99a9bf;
                }

                .events-table-expand .el-form-item {
                    margin-right: 0;
                    margin-bottom: 0;
                    width: 100%;
                }
            }
        }
    }

    .topo-info-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
            width: 35px;
            height: 35px;
        }
    }

    .topo-info-empty {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ccc;
        font-size: 18px;
    }
}
</style>
