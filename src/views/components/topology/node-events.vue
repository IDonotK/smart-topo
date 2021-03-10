<template>
  <div class="node-events">
    <!-- 查询 -->
    <div class="form-wrapper">
      <vxe-form size="small" :data="formData" @submit="handleSubmit" @reset="handleReset">
        <vxe-form-item span="6" title-align="right" :title="$t('nodeEvents_eventData_id')" field="id">
          <template v-slot>
            <vxe-input v-model="formData.id" :placeholder="$t('nodeEvents_searchOption_id_tip')"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item span="6" title-align="right" :title="$t('nodeEvents_eventData_name')" field="name">
          <template v-slot>
            <vxe-input v-model="formData.name" :placeholder="$t('nodeEvents_searchOption_name_tip')"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item span="6" title-align="right" :title="$t('nodeEvents_eventData_severity')" field="severity">
          <template v-slot>
            <vxe-select v-model="formData.severity" :placeholder="$t('nodeEvents_searchOption_severity_tip')" clearable>
              <vxe-option value="Critical" label="Critical"></vxe-option>
              <vxe-option value="Warning" label="Warning"></vxe-option>
            </vxe-select>
          </template>
        </vxe-form-item>
        <vxe-form-item
          span="6"
          title-align="right"
          :title="$t('nodeEvents_eventData_source')"
          field="source"
          class="source-options"
        >
          <template v-slot>
            <vxe-select
              v-model="formData.eventSource"
              :placeholder="$t('nodeEvents_searchOption_source_tip')"
              clearable
            >
              <vxe-option
                v-for="(item, index) in eventSources"
                :key="'event-source' + index"
                :value="item"
                :label="item"
              ></vxe-option>
            </vxe-select>
          </template>
        </vxe-form-item>
        <vxe-form-item
          span="24"
          title-align="right"
          :title="$t('nodeEvents_eventData_createTime')"
          field="createTime"
          :visible="showTimeFilter"
        >
          <template v-slot>
            <el-date-picker
              v-model="formData.createTimeRange"
              size="mini"
              type="datetimerange"
              :picker-options="datePickerOptions"
              :range-separator="$t('nodeEvents_searchOption_timeSeparator')"
              :start-placeholder="$t('nodeEvents_searchOption_startTime')"
              :end-placeholder="$t('nodeEvents_searchOption_endTime')"
              align="right"
            >
            </el-date-picker>
          </template>
        </vxe-form-item>
        <vxe-form-item
          span="24"
          title-align="right"
          :title="$t('nodeEvents_eventData_updateTime')"
          field="updateTime"
          :visible="showTimeFilter"
        >
          <template v-slot>
            <el-date-picker
              v-model="formData.updateTimeRange"
              size="mini"
              type="datetimerange"
              :picker-options="datePickerOptions"
              :range-separator="$t('nodeEvents_searchOption_timeSeparator')"
              :start-placeholder="$t('nodeEvents_searchOption_startTime')"
              :end-placeholder="$t('nodeEvents_searchOption_endTime')"
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
              <vxe-button type="submit" status="primary">{{ $t('search') }}</vxe-button>
              <vxe-button type="reset">{{ $t('reset') }}</vxe-button>
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
      id="eventsTable"
      ref="eventsTable"
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
      <vxe-table-column type="seq" :title="$t('nodeEvents_eventData_seq')" fixed="left"></vxe-table-column>
      <vxe-table-column field="id" :title="$t('nodeEvents_eventData_id')"></vxe-table-column>
      <vxe-table-column field="name" :title="$t('nodeEvents_eventData_name')" sortable></vxe-table-column>
      <vxe-table-column field="severity" :title="$t('nodeEvents_eventData_severity')"></vxe-table-column>
      <vxe-table-column field="status" :title="$t('nodeEvents_eventData_status')"></vxe-table-column>
      <vxe-table-column field="eventSource" :title="$t('nodeEvents_eventData_source')"></vxe-table-column>
      <vxe-table-column field="eventDetails" :title="$t('nodeEvents_eventData_description')"></vxe-table-column>
      <vxe-table-column field="timeStamp" :title="$t('nodeEvents_eventData_timeStamp')"></vxe-table-column>
      <vxe-table-column
        field="createTime"
        :title="$t('nodeEvents_eventData_createTime')"
        sortable
        width="100"
      ></vxe-table-column>
      <vxe-table-column
        field="updateTime"
        :title="$t('nodeEvents_eventData_updateTime')"
        sortable
        width="100"
      ></vxe-table-column>
      <vxe-table-column title="操作" show-overflow width="90">
        <template v-slot="{ row }">
          <span class="operate-item" @click="openEventDetail(row)">{{
            $t('nodeEvents_eventTable_operation_checkDetails')
          }}</span>
        </template>
      </vxe-table-column>
    </vxe-table>

    <!-- 事件详情 -->
    <div class="event-detail-wrapper">
      <vxe-modal
        v-model="showEventDetails"
        :title="$t('nodeEvents_eventData_details')"
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
        return '';
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
      datePickerOptions: {},
      showTimeFilter: false,
      showEventDetails: false,
      eventDetailData: [],
      eventDataModel: [
        { label: this.$t('nodeEvents_eventData_id'), field: 'id' },
        { label: this.$t('nodeEvents_eventData_name'), field: 'name' },
        { label: this.$t('nodeEvents_eventData_severity'), field: 'severity' },
        { label: this.$t('nodeEvents_eventData_status'), field: 'status' },
        { label: this.$t('nodeEvents_eventData_source'), field: 'eventSource' },
        { label: this.$t('nodeEvents_eventData_description'), field: 'eventDetails' },
        { label: this.$t('nodeEvents_eventData_timeStamp'), field: 'timeStamp' },
        { label: this.$t('nodeEvents_eventData_createTime'), field: 'createTime' },
        { label: this.$t('nodeEvents_eventData_updateTime'), field: 'updateTime' },
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
    this.initDatePickerOptions();
    this.setEventSources();
    this.getViewNodeEvents();
  },

  mounted() {
    window.onresize = () => {
      this.tableData = JSON.parse(JSON.stringify(this.tableData));
    };
  },

  methods: {
    initDatePickerOptions() {
      this.datePickerOptions = {
        shortcuts: [
          {
            text: this.$t('rkDate_quickOption_recentTenMinutes'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 10 * 60 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('rkDate_quickOption_recentThirtyMinutes'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 30 * 60 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('rkDate_quickOption_recentOneHour'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 60 * 60 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('rkDate_quickOption_recentSixHour'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 6 * 60 * 60 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
        ]
      };
    },
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
      this.eventDetailData = this.eventDataModel.map(item => ({ label: item.label, value: row[item.field] }));
      this.showEventDetails = true;
    },
    handleSubmit() {
      this.getViewNodeEvents();
    },
    handleReset() {
      for (let key in this.formData) {
        if (Object.prototype.hasOwnProperty.call(this.formData, key)) {
          this.formData[key] = '';
        }
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
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
        event_id: this.formData.id,
        event_name: this.formData.name,
        event_severity: this.formData.severity,
        event_source: this.formData.eventSource,
        event_create_time_start: this.formData.createTimeRange && this.formData.createTimeRange.length > 0 ? dateFormat('YYYY-mm-dd HH:MM:SS', this.formData.createTimeRange[0]) : '',
        event_create_time_end: this.formData.createTimeRange && this.formData.createTimeRange.length > 0 ? dateFormat('YYYY-mm-dd HH:MM:SS', this.formData.createTimeRange[1]) : '',
        event_update_time_start: this.formData.updateTimeRange && this.formData.updateTimeRange.length > 0 ? dateFormat('YYYY-mm-dd HH:MM:SS', this.formData.updateTimeRange[0]) : '',
        event_update_time_end: this.formData.updateTimeRange && this.formData.updateTimeRange.length > 0 ? dateFormat('YYYY-mm-dd HH:MM:SS', this.formData.updateTimeRange[1]) : '',
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
                padding-right: 0;
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
                margin-left: 0;

                &.is--active {
                    .vxe-button {
                        background-color: rgba(204, 204, 204, 0.1);
                    }
                }

                .vxe-custom--option-wrapper {
                    top: 34px !important;
                    right: 0 !important;
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
