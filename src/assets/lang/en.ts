const m = {
  // common tips
  auto: 'Auto',
  reload: 'Reload',
  second: 's',
  confirm: 'Confirm',
  cancel: 'Cancel',
  copy: 'Copy',
  all: 'All',
  success: 'Success',
  error: 'Error',
  status: 'Status',
  search: 'Search',
  reset: 'Reset',
  clear: 'Clear',
  more: 'More',
  noData: 'No data!',
  back: 'Back',

  // basical components
  rkHeader_product_title: 'HCS Holographic Analysis',
  rkHeader_navigation_topology: 'Topology',
  rkHeader_navigation_helpCenter: 'Help Center',
  rkHeader_autoTime_tip: 'Range:[10,3600]',

  rkDate_quickOption_recentOneMinute: 'Last 1 min',
  rkDate_quickOption_recentTenMinutes: 'Last 10 mins',
  rkDate_quickOption_recentThirtyMinutes: 'Last 30 mins',
  rkDate_quickOption_recentOneHour: 'Last 1 hour',
  rkDate_quickOption_recentSixHour: 'Last 6 hours',
  rrkDate_timeRange_max: 'The time interval must not exceed 24 hours',
  rrkDate_timeRange_min: 'The time interval should be at least 30 seconds',
  rkDate_pickOption_hour: 'Select Hour',
  rkDate_pickOption_minute: 'Select Minute',
  rkDate_pickOption_second: 'Select Second',
  rkDate_year_suffix: 'Year',
  rkDate_months_head: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec',
  rkDate_months: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec',
  rkDate_weeks: 'Mon_Tue_Wed_Thu_Fir_Sat_Sun',

  // business components
  topoView_explore_node_title: 'Determine the node to explore?',
  topoView_explore_node_id: 'Node ID:',
  topoView_search_no_data: 'No matching node!',

  topoDetail_link_type: 'Link type:',
  topoDetail_link_callPerMinute: 'CallPerMinute:',
  topoDetail_link_callPerMinute_unit: 'r/min',
  topoDetail_link_responseTimePerMin: 'Response Time Per Min:',
  topoDetail_link_responseTimePerMin_unit: 'ms',

  nodeDetail_eventLevel_help: 'The most serious level of the current node event',
  nodeDetail_singleHopNodes_title: 'Single Hop Nodes:',

  topoTimeLine_viewMode_all: 'Full Range',
  topoTimeLine_viewMode_unit: 'Unit Range',
  topoTimeLine_viewMode_all_tip:
    'Full Range: the time range is the entire period of time corresponding to the time axis.',
  topoTimeLine_viewMode_unit_tip:
    'Unit Range: the time range is 1 hour on the time axis, less than 1 hour is considered as less than 1 hour.',
  topoTimeLine_playTime_tip: 'Range:[3,60], the time slider moves to the right every {interval} second',

  topoSideNavigation_nodesCount_all: 'Total',
  topoSideNavigation_nodesCount_all_tip: 'Total number of {type}',
  topoSideNavigation_nodesCount_normal: 'Normal',
  topoSideNavigation_nodesCount_abnormal: 'Abnormal',
  topoSideNavigation_nodesCount_abnormal_tip: 'Number of {type} with events',

  topoSideInformation_topoInfo_mode: 'Topology exploration mode:',
  topoSideInformation_topoInfo_mode_global: 'All Nodes',
  topoSideInformation_topoInfo_mode_specific: 'Specific Node',
  topoSideInformation_topoInfo_node_type: 'Displayed Node Type:',
  topoSideInformation_topoInfo_node_state: 'Displayed Node State:',
  topoSideInformation_topoInfo_node_selected: 'Name of Selected Node:',
  topoSideInformation_topoInfo_node_relation: 'Displayed Relation Type:',
  topoSideInformation_topoInfo_node_relation_up: 'Upstream Node',
  topoSideInformation_topoInfo_node_relation_down: 'Downstream Node',
  topoSideInformation_nodeInfo_node_checked: 'Info of Node to be Checked:',
  topoSideInformation_nodeInfo_check_event: 'Check Event',
  topoSideInformation_nodeInfo_event_list: 'Evemt List',

  topoToolSet_explore_node_title: 'Explore Topology',
  topoToolSet_explore_node_back: 'Go back to explore all nodes',
  topoToolSet_explore_node_back_tip: 'Are you sure to return to explore all nodes?',
  topoToolSet_explore_mode_specific: 'Specific Node',
  topoToolSet_explore_search_placeholder: 'Please enter a node ID',
  topoToolSet_explore_search_check_null: 'Node ID cannot be empty',
  topoToolSet_explore_search_check_exist: 'Node ID does not exist',
  topoToolSet_explore_mode_global: 'All Nodes',
  topoToolSet_search_placeholder: 'Please enter a node ID',
  topoToolSet_topoCtrl_enlarge: 'Enlarge Topology',
  topoToolSet_topoCtrl_narrow: 'Narrow Topology',
  topoToolSet_topoCtrl_restore: 'Restore Topology',
  topoToolSet_topoCtrl_erase: 'Clear Selected Node',

  nodeEvents_eventData_seq: 'Seq',
  nodeEvents_eventData_id: 'ID',
  nodeEvents_eventData_name: 'Name',
  nodeEvents_eventData_severity: 'Severity',
  nodeEvents_eventData_status: 'Status',
  nodeEvents_eventData_source: 'Source',
  nodeEvents_eventData_description: 'Description',
  nodeEvents_eventData_timeStamp: 'TimeStamp',
  nodeEvents_eventData_createTime: 'CreateTime',
  nodeEvents_eventData_updateTime: 'UpdateTime',
  nodeEvents_eventTable_operation: 'Operation',
  nodeEvents_eventTable_operation_checkDetails: 'Check Details',
  nodeEvents_eventData_details: 'Event Details',
  nodeEvents_searchOption_id_tip: 'Please enter the id',
  nodeEvents_searchOption_name_tip: 'Please enter name',
  nodeEvents_searchOption_severity_tip: 'Please select the level',
  nodeEvents_searchOption_source_tip: 'Please select source',
  nodeEvents_searchOption_startTime: 'Start Time',
  nodeEvents_searchOption_timeSeparator: '~',
  nodeEvents_searchOption_endTime: 'End Time',
};

export default m;
