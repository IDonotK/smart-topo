<template>
  <div class="rk-topo">
    <TopoView :topoData="{ nodes: filteredStateTopo.nodes, calls: filteredStateTopo.calls }" />
    <TopoSideNavigation />
    <div style="display:none">{{filterNodeType}}</div>

    <!-- 中间拓扑图 -->
    <!-- <Topo
      :current="current"
      @setDialog="(type) => (dialog = type)"
      @setCurrent="setCurrent"
      :nodes="stateTopo.nodes"
      :links="stateTopo.calls"
    /> -->

    <!-- 左上角选择服务 -->
    <!-- <TopoAside /> -->

    <!-- 左下角创建分组 -->
    <!-- <TopoGroup /> -->

  </div>
</template>
<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import { State, Action, Getter, Mutation } from 'vuex-class';
  import { AxiosResponse } from 'axios';
  import { State as topoState } from '@/store/modules/topology';
  import { TopologyType } from '../../constant';
  import WindowEndpoint from '@/views/containers/topology/endpoint/index.vue';
  import WindowInstance from '@/views/containers/topology/instance/index.vue';
  import WindowTrace from '@/views/containers/topology/trace/index.vue';
  import WindowAlarm from '@/views/containers/topology/alarm/index.vue';
  import Topo from '../../components/topology/chart/topo.vue';
  import TopoAside from '../../components/topology/topo-aside.vue';
  import TopoGroup from '../../components/topology/topo-group/index.vue';
  import WindowEndpointDependency from '@/views/containers/topology/endpoint-dependency/index.vue';

  import TopoView from '../../components/topology/topo-view.vue';
  import LOCAL_STATE_TOPO from './data.js';
  import TopoSideNavigation from '../../components/topology/topo-side-navigation.vue';

  @Component({
    components: {
      Topo,
      TopoAside,
      TopoGroup,
      WindowEndpoint,
      WindowInstance,
      WindowTrace,
      WindowAlarm,
      WindowEndpointDependency,
      TopoView,
      TopoSideNavigation
    },
  })
  export default class Topology extends Vue {
    @State('rocketTopo') private stateTopo!: topoState; // 默认匹配src\store\modules\topology\index.ts里的state
    @Action('rocketTopo/CLEAR_TOPO') private CLEAR_TOPO: any;
    @Action('rocketTopo/CLEAR_TOPO_INFO') private CLEAR_TOPO_INFO: any;
    @Action('GET_ALL_TEMPLATES') private GET_ALL_TEMPLATES: any;
    @Mutation('rocketTopo/SET_TOPO_ENDPOINT') private SET_TOPO_ENDPOINT: any;
    @Mutation('rocketTopo/SET_TOPO_INSTANCE') private SET_TOPO_INSTANCE: any;
    @Mutation('SET_CURRENT_SERVICE') private SET_CURRENT_SERVICE: any;
    @Getter('durationTime') private durationTime: any;

    private current: any = {};
    private dialog: string = '';
    private updateObjects: string = '';

    private filteredStateTopo: any = {};

    private created() {
      this.filterTopoOnType('All'); // computed或watch改造？
    }

    private get filterNodeType() {
      this.filterTopoOnType(this.$store.state.rocketTopo.filterNodeType);
      return this.$store.state.rocketTopo.filterNodeType;
    }

    private filterTopoOnType(nodeType: string): void {
      if (nodeType === 'All') {
        this.filteredStateTopo = LOCAL_STATE_TOPO;
        return;
      }
      let nodesTmp = LOCAL_STATE_TOPO.nodes.filter(node => node.type === nodeType);
      let callsTmp = LOCAL_STATE_TOPO.calls.filter(call => {
        return nodesTmp
          && nodesTmp.some(node => node.id === call.source.id)
          && nodesTmp.some(node => node.id === call.target.id);
      });
      this.filteredStateTopo = {
        nodes: nodesTmp,
        calls: callsTmp
      }
    }

    private queryTemplates() {
      this.GET_ALL_TEMPLATES().then(
        (
          allTemplates: Array<{
            name: string;
            type: string;
            configuration: string;
            activated: boolean;
            disabled: boolean;
          }>,
        ) => {
          // 提取TOPOLOGY_INSTANCE类型的模板，并将其configuration更新到state、localStorage
          const template = allTemplates.filter((item: any) => {
              return item.type === TopologyType.TOPOLOGY_INSTANCE && item.activated;
          })[0] || {};
          const instanceComps = JSON.parse(template.configuration) || [];
          this.SET_TOPO_INSTANCE(instanceComps);

          // 提取TOPOLOGY_ENDPOINT类型的模板，并将其configuration更新到state、localStorage
          const endpointTemplate = allTemplates.filter((item: any) => {
            return item.type === TopologyType.TOPOLOGY_ENDPOINT && item.activated;
          })[0] || {};
          const endpointComps = JSON.parse(endpointTemplate.configuration) || [];
          this.SET_TOPO_ENDPOINT(endpointComps);
        },
      );
    }
    private setCurrent(d: any): void {
      this.current = d;
      this.SET_CURRENT_SERVICE(d);
    }
    private beforeDestroy() {
      this.CLEAR_TOPO_INFO();
      this.CLEAR_TOPO();
    }
    private changeInstanceComps(data: { type: string; json: any }) {
      this.updateObjects = data.type;
      if (!data.json) {
        return;
      }
      this.SET_TOPO_INSTANCE(data.json);
    }
    private changeEndpointComps(data: { type: string; json: any }) {
      this.updateObjects = data.type;
      if (!data.json) {
        return;
      }
      this.SET_TOPO_ENDPOINT(data.json);
    }
  }
</script>
<style lang="scss">
  .rk-topo {
    position: absolute;
    top: 48px;
    bottom: 30px;
    left: 0;
    right: 0;
    min-height: 320px;
    min-width: 500px;
    background: #333840;
    overflow: hidden;
  }
</style>
