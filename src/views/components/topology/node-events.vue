<template>
  <div class="node-events">
    <!-- 查询 -->
    <div class="form-wrapper">
      <vxe-form size="small" :data="formData" @submit="handleSubmit" @reset="handleReset">
        <vxe-form-item span="6" title-align="right" title="ID" field="id">
          <template v-slot>
            <vxe-input v-model="formData.id" placeholder="请输入id"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item span="6" title-align="right" title="名称" field="name">
          <template v-slot>
            <vxe-input v-model="formData.name" placeholder="请输入名称"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item span="6" title-align="right" title="等级" field="severity">
          <template v-slot>
            <vxe-select v-model="formData.severity" placeholder="请选择等级" clearable>
              <vxe-option value="Critical" label="Critical"></vxe-option>
              <vxe-option value="Warning" label="Warning"></vxe-option>
            </vxe-select>
          </template>
        </vxe-form-item>
        <vxe-form-item span="6" title-align="right" title="来源" field="severity" class="source-options">
          <template v-slot>
            <vxe-select v-model="formData.eventSource" placeholder="请选择来源" clearable>
              <vxe-option
                v-for="(item, index) in eventSources"
                :key="'event-source' + index"
                :value="item"
                :label="item"
              ></vxe-option>
            </vxe-select>
          </template>
        </vxe-form-item>
        <vxe-form-item span="24" title-align="right" title="创建时间" field="createTime" :visible="showTimeFilter">
          <template v-slot>
            <el-date-picker
              size="mini"
              v-model="formData.createTimeRange"
              type="datetimerange"
              :picker-options="datePickerOptions"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              align="right"
            >
            </el-date-picker>
          </template>
        </vxe-form-item>
        <vxe-form-item span="24" title-align="right" title="更新时间" field="updateTime" :visible="showTimeFilter">
          <template v-slot>
            <el-date-picker
              size="mini"
              v-model="formData.updateTimeRange"
              type="datetimerange"
              :picker-options="datePickerOptions"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              align="right"
            >
            </el-date-picker>
          </template>
        </vxe-form-item>
        <vxe-form-item span="24" align="right">
          <template v-slot>
            <div class="search-wrapper">
              <svg
                class="icon toggle-time-filter"
                :style="`transform: rotate(${showTimeFilter ? 180 : 0}deg)`"
                @click="toggleTimeFilter"
              >
                <use xlink:href="#arrow-down"></use>
              </svg>
              <vxe-button type="submit" status="primary">查询</vxe-button>
              <vxe-button type="reset">重置</vxe-button>
            </div>
          </template>
        </vxe-form-item>
      </vxe-form>
    </div>

    <!-- 自定义列 -->
    <div class="toolbar-wrapper">
      <vxe-toolbar custom size="small"> </vxe-toolbar>
    </div>

    <!-- 表格 -->
    <vxe-table
      ref="eventsTable"
      id="eventsTable"
      class="events-table"
      border
      resizable
      size="small"
      max-height="75%"
      show-overflow
      show-header-overflow
      highlight-hover-row
      highlight-current-row
      :loading="loading"
      :data="tableData"
      :custom-config="{
        storage: true,
      }"
    >
      <vxe-table-column type="seq" title="序号" fixed="left" width="60"></vxe-table-column>
      <vxe-table-column field="id" title="ID" :visible="false"></vxe-table-column>
      <vxe-table-column field="name" title="名称" sortable></vxe-table-column>
      <vxe-table-column field="severity" title="等级"></vxe-table-column>
      <vxe-table-column field="status" title="状态" :visible="false"></vxe-table-column>
      <vxe-table-column field="eventSource" title="来源" :visible="false"></vxe-table-column>
      <vxe-table-column field="eventDetails" title="描述"></vxe-table-column>
      <vxe-table-column field="timeStamp" title="时间戳" :visible="false"></vxe-table-column>
      <vxe-table-column field="createTime" title="创建时间" sortable :visible="false"></vxe-table-column>
      <vxe-table-column field="updateTime" title="更新时间" sortable :visible="false"></vxe-table-column>
      <vxe-table-column title="操作" width="100" show-overflow>
        <template v-slot="{ row }">
          <span class="operate-item" @click="openEventDetail(row)">查看详情</span>
        </template>
      </vxe-table-column>
    </vxe-table>

    <!-- 事件详情 -->
    <div class="event-detail-wrapper">
      <vxe-modal
        v-model="showEventDetails"
        title="事件详情"
        width="600"
        height="400"
        :mask="true"
        :lock-view="false"
        resize
        mask-closable
      >
        <template v-slot>
          <vxe-table
            border="inner"
            auto-resize
            highlight-hover-row
            :scroll-y="{ enabled: false }"
            height="auto"
            :show-header="false"
            :sync-resize="showEventDetails"
            :data="eventDetailData"
          >
            <vxe-table-column field="label" width="100"></vxe-table-column>
            <vxe-table-column field="value"></vxe-table-column>
          </vxe-table>
        </template>
      </vxe-modal>
    </div>

    <!-- 分页 -->
    <div class="page-wrapper">
      <vxe-pager
        size="small"
        :loading="loading"
        :current-page="tablePage.currentPage"
        :page-size="tablePage.pageSize"
        :total="tablePage.total"
        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
        :pager-count="5"
        :page-sizes="[10, 15, 20, 50, 100]"
        @page-change="handlePageChange"
      >
      </vxe-pager>
    </div>
  </div>
</template>

<script lang="js">
  import { dateFormat } from '@/utils/topo';

  export default {
    props: {
      viewNodeId: {
        type: String,
        default() {
          return "";
        },
      }
    },

    data() {
      return {
        loading: false,
        tableData: [],
        tablePage: {
          currentPage: 1,
          pageSize: 10,
          total: 0
        },
        formData: {
          id: '',
          name: '',
          severity: '',
          eventSource: '',
          createTimeRange: [],
          updateTimeRange: [],
        },
        eventSources: ['k8s'],
        datePickerOptions: {
          shortcuts: [
            {
              text: '最近10分钟',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 10 * 60 * 1000);
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '最近30分钟',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 30 * 60 * 1000);
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '最近1小时',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 60 * 60 * 1000);
                picker.$emit('pick', [start, end]);
              }
            },
            {
              text: '最近6小时',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 6 * 60 * 60 * 1000);
                picker.$emit('pick', [start, end]);
              }
            },
          ]
        },
        showTimeFilter: false,
        showEventDetails: false,
        eventDetailData: [],
        eventDataModel: [
          { label: 'ID', field: 'id' },
          { label: '名称', field: 'name' },
          { label: '等级', field: 'severity' },
          { label: '状态', field: 'status' },
          { label: '来源', field: 'eventSource' },
          { label: '描述', field: 'eventDetails' },
          { label: '时间戳', field: 'timeStamp' },
          { label: '创建时间', field: 'createTime' },
          { label: '更新时间', field: 'updateTime' },
        ],
      }
    },

    computed: {
      durationRow() {
        return this.$store.state.rocketbot.durationRow;
      },
      sceneConfig() {
        return this.$store.state.rocketTopo.sceneConfig;
      },
    },

    watch: {
      sceneConfig() {
        this.setEventSources();
      }
    },

    created() {
      this.setEventSources();
      this.getViewNodeEvents();
    },

    mounted() {
      window.onresize = () => {
        this.tableData = JSON.parse(JSON.stringify(this.tableData));
      };
    },

    methods: {
      setEventSources() {
        if (this.sceneConfig.eventSource) {
          this.eventSources = this.sceneConfig.eventSource.split(',');
        } else {
          this.eventSources = ['k8s'];
        }
      },
      toggleTimeFilter() {
        this.showTimeFilter = !this.showTimeFilter;
        this.tableData = JSON.parse(JSON.stringify(this.tableData));
        if (!this.showTimeFilter) {
          this.formData.createTimeRange = [];
          this.formData.updateTimeRange = [];
        }
      },
      openEventDetail(row) {
        this.eventDetailData = this.eventDataModel.map(item => {
          return { label: item.label, value: row[item.field] };
        });
        this.showEventDetails = true;
      },
      handleSubmit() {
        this.getViewNodeEvents();
      },
      handleReset() {
        for (let key in this.formData) {
          this.formData[key] = '';
        }
        this.getViewNodeEvents();
      },
      handlePageChange({ currentPage, pageSize }) {
        this.tablePage.currentPage = currentPage;
        this.tablePage.pageSize = pageSize;
        this.getViewNodeEvents();
      },
      queryNodeEvents() {
        const params = {
          id: this.viewNodeId,
          offset: (this.tablePage.currentPage - 1) * this.tablePage.pageSize,
          limit: this.tablePage.pageSize,
          start_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
          end_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
          event_id: this.formData.id,
          event_name: this.formData.name,
          event_severity: this.formData.severity,
          event_source: this.formData.eventSource,
          event_create_time_start: this.formData.createTimeRange.length > 0 ? dateFormat("YYYY-mm-dd HH:MM:SS", this.formData.createTimeRange[0]) : '',
          event_create_time_end: this.formData.createTimeRange.length > 0 ? dateFormat("YYYY-mm-dd HH:MM:SS", this.formData.createTimeRange[1]) : '',
          event_update_time_start: this.formData.updateTimeRange.length > 0 ? dateFormat("YYYY-mm-dd HH:MM:SS", this.formData.updateTimeRange[0]) : '',
          event_update_time_end: this.formData.updateTimeRange.length > 0 ? dateFormat("YYYY-mm-dd HH:MM:SS", this.formData.updateTimeRange[1]) : '',
        };
        return this.$store.dispatch('rocketTopo/GET_EVENTS_DATA', params);
      },
      async getViewNodeEvents() {
        let eventsData = await this.queryNodeEvents();
        if (eventsData && eventsData.events) {
          this.tableData = eventsData.events;
        }
        if (eventsData && eventsData.total) {
          this.tablePage.total = eventsData.total;
        }
      },
    }
  }
</script>

<style lang="scss">
  .node-events {
    width: 100%;
    height: 100%;

    .form-wrapper {
      .vxe-form {
        max-height: 500px;
        transition: height 1s;
        -webkit-transition: height 1s;
        .vxe-form--item:nth-child(4) {
          padding-right: 0px;
        }

        .el-input__inner {
          background-color: rgba(51, 56, 64, 1);
          border-color: rgba(204, 204, 204, 0.1);

          .el-range-input {
            background-color: rgba(51, 56, 64, 1);
            color: #ddd;
          }
          .el-range-separator {
            color: #c0c4cc;
          }
        }
      }

      .vxe-select-option--wrapper {
        border-color: rgba(204, 204, 204, 0.1) !important;

        .vxe-select-option:not(.is--disabled).is--hover {
          background-color: rgba(36, 36, 36, 0.8);
        }
      }

      .vxe-button {
        &.theme--primary {
          .vxe-button--content {
            color: #ddd;
          }
        }
      }

      .search-wrapper {
        padding-right: 30px;

        .toggle-time-filter {
          cursor: pointer;
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }

    .toolbar-wrapper {
      position: relative;

      .vxe-toolbar {
        position: absolute;
        right: 0;
        bottom: 100%;
        height: 45px;

        .vxe-custom--wrapper {
          margin-left: 0px;

          &.is--active {
            .vxe-button {
              background-color: rgba(204, 204, 204, 0.1);
            }
          }

          .vxe-custom--option-wrapper {
            top: 34px !important;
            right: 0px !important;
            background-color: rgba(51, 56, 64, 1);
            border-color: rgba(204, 204, 204, 0.1);

            .vxe-custom--header {
              border-bottom-color: rgba(204, 204, 204, 0.1);
            }

            .vxe-custom--footer {
              border-top-color: rgba(204, 204, 204, 0.1);
            }
          }
        }
      }
    }

    .events-table {
      .operate-item {
        cursor: pointer;
      }
    }

    .event-detail-wrapper {
      .vxe-modal--body {
        overflow: hidden !important;

        .vxe-modal--content {
          overflow: hidden !important;
        }
      }
    }

    .page-wrapper {
      .vxe-select-option--wrapper {
        border-color: rgba(204, 204, 204, 0.1) !important;
      }
    }
  }
</style>
