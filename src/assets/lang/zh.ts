const m = {
  // common tips
  auto: '自动',
  reload: '刷新',
  second: '秒',
  confirm: '确定',
  cancel: '取消',
  copy: '复制',
  all: '全部',
  success: '成功',
  error: '失败',
  status: '状态',
  search: '查询',
  reset: '重置',
  clear: '清空',
  more: '更多',
  noData: '暂无数据！',
  back: '返回',

  // basical components
  rkHeader_product_title: 'HCS全息排查',
  rkHeader_navigation_topology: '拓扑图',
  rkHeader_navigation_helpCenter: '帮助中心',
  rkHeader_autoTime_tip: '范围:[10,3600]',

  rkDate_quickOption_recentOneMinute: '最近1分钟',
  rkDate_quickOption_recentTenMinutes: '最近10分钟',
  rkDate_quickOption_recentThirtyMinutes: '最近30分钟',
  rkDate_quickOption_recentOneHour: '最近1小时',
  rkDate_quickOption_recentSixHour: '最近6小时',
  rrkDate_timeRange_max: '时间区间不能超过24小时',
  rrkDate_timeRange_min: '时间区间至少大于30秒钟',
  rkDate_pickOption_hour: '选择小时',
  rkDate_pickOption_minute: '选择分钟',
  rkDate_pickOption_second: '选择秒数',
  rkDate_year_suffix: '年',
  rkDate_months_head: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月',
  rkDate_months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月',
  rkDate_weeks: '一_二_三_四_五_六_日',

  // business components
  topoView_explore_node_title: '确定探索该节点？',
  topoView_explore_node_id: '节点ID：',
  topoView_search_no_data: '无匹配节点！',
  topoView_quick_explre_topo_title_type: '拓扑类型：',
  topoView_quick_explre_topo_title_target_node: '目标节点：',
  topoView_quick_explre_topo_upstream: '上游拓扑',
  topoView_quick_explre_topo_downstream: '下游拓扑',

  topoDetail_link_type: '链路类型：',
  topoDetail_link_callPerMinute: '调用频率：',
  topoDetail_link_callPerMinute_unit: '次/分钟',
  topoDetail_link_responseTimePerMin: '平均响应时间：',
  topoDetail_link_responseTimePerMin_unit: 'ms',

  nodeDetail_eventLevel_help: '当前节点事件的最严重级别',
  nodeDetail_singleHopNodes_title: '第一跳节点：',

  topoTimeLine_viewMode_all: '全部区间',
  topoTimeLine_viewMode_unit: '单位区间',
  topoTimeLine_viewMode_all_tip: '全部区间：时间范围为时间轴对应的整段时间',
  topoTimeLine_viewMode_unit_tip: '单位区间：时间范围为时间轴上的1小时，不满1小时按不满1小时算',
  topoTimeLine_playTime_tip: '范围：[3,60]，时间滑块每隔{interval}秒右移一次',

  topoSideNavigation_nodesCount_all: '总数',
  topoSideNavigation_nodesCount_all_tip: '{type}总数',
  topoSideNavigation_nodesCount_normal: '正常',
  topoSideNavigation_nodesCount_abnormal: '异常',
  topoSideNavigation_nodesCount_abnormal_tip: '关联事件的{type}数量',

  topoSideInformation_topoInfo_mode: '拓扑探索模式：',
  topoSideInformation_topoInfo_mode_global: '全部节点',
  topoSideInformation_topoInfo_mode_specific: '目标节点',
  topoSideInformation_topoInfo_node_type: '显示节点类型：',
  topoSideInformation_topoInfo_node_state: '显示节点状态：',
  topoSideInformation_topoInfo_node_selected: '选中节点名称：',
  topoSideInformation_topoInfo_node_relation: '关联节点类型：',
  topoSideInformation_topoInfo_node_relation_up: '上游节点',
  topoSideInformation_topoInfo_node_relation_down: '下游节点',
  topoSideInformation_nodeInfo_node_checked: '当前查看的节点信息：',
  topoSideInformation_nodeInfo_check_event: '查看事件',
  topoSideInformation_nodeInfo_event_list: '事件列表',

  topoToolSet_explore_node_title: '探索拓扑',
  topoToolSet_explore_node_back: '返回探索全部节点',
  topoToolSet_explore_node_back_tip: '确定返回探索全部节点？',
  topoToolSet_explore_mode_specific: '目标节点',
  topoToolSet_explore_search_placeholder: '请输入节点ID',
  topoToolSet_explore_search_check_null: '节点ID不能为空',
  topoToolSet_explore_search_check_exist: '节点ID不存在',
  topoToolSet_explore_mode_global: '全部节点',
  topoToolSet_search_placeholder: '请输入节点ID',
  topoToolSet_topoCtrl_enlarge: '放大拓扑',
  topoToolSet_topoCtrl_narrow: '缩小拓扑',
  topoToolSet_topoCtrl_restore: '还原拓扑',
  topoToolSet_topoCtrl_erase: '清除选中节点',

  nodeEvents_eventData_seq: '序号',
  nodeEvents_eventData_id: 'ID',
  nodeEvents_eventData_name: '名称',
  nodeEvents_eventData_severity: '等级',
  nodeEvents_eventData_status: '状态',
  nodeEvents_eventData_source: '来源',
  nodeEvents_eventData_description: '描述',
  nodeEvents_eventData_timeStamp: '时间戳',
  nodeEvents_eventData_createTime: '创建时间',
  nodeEvents_eventData_updateTime: '更新时间',
  nodeEvents_eventTable_operation: '操作',
  nodeEvents_eventTable_operation_checkDetails: '查看详情',
  nodeEvents_eventData_details: '事件详情',
  nodeEvents_searchOption_id_tip: '请输入id',
  nodeEvents_searchOption_name_tip: '请输入名称',
  nodeEvents_searchOption_severity_tip: '请选择等级',
  nodeEvents_searchOption_source_tip: '请选择来源',
  nodeEvents_searchOption_startTime: '开始时间',
  nodeEvents_searchOption_timeSeparator: '至',
  nodeEvents_searchOption_endTime: '结束时间',
  nodeEvents_searchOption_input_limit: '请输入{start}~{end}个字符',

  svgRender_upstream_tip: '查看上游节点',
  svgRender_downstream_tip: '查看下游节点',
};

export default m;
