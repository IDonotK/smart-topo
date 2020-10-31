<template>
  <div class="topo-tool-set">
    <!-- 搜索节点 -->
    <div class="search-wrapper">
      <input type="text" class="sw-input" v-model="inputId" placeholder="请输入节点ID" />
      <span class="sw-clear">
        <svg class="icon sm close" @click="handleClearInputId" v-if="inputId">
          <use xlink:href="#clear"></use>
        </svg>
      </span>
      <span class="sw-search">
        <svg class="topo-icon" aria-hidden="true" @click="handleSearchOnId">
          <use xlink:href="#icon-sousuo"></use>
        </svg>
      </span>
    </div>
    <!-- 缩放控制 -->
    <div class="size-controller">
      <svg class="topo-icon larger" aria-hidden="true" @click="handleEnlargeTopo">
        <use xlink:href="#icon-fangdajingfangda"></use>
      </svg>
      <svg class="topo-icon smaller" aria-hidden="true" @click="handleNarrowTopo">
        <use xlink:href="#icon-fangdajingsuoxiao"></use>
      </svg>
      <svg class="topo-icon restore" aria-hidden="true" @click="handleRestoreTopo">
        <use xlink:href="#icon-huanyuan"></use>
      </svg>
    </div>
    <!-- 更多按钮 -->
    <div class="more-tool-btn">
      <svg class="topo-icon more" aria-hidden="true" @click="handleToggleMoreTool">
        <use xlink:href="#icon-gengduo"></use>
      </svg>
    </div>
    <!-- 工具集合 -->
    <div class="more-tool-wrapper" v-if="moreToolState">
      <!-- 隐藏节点类型 -->
      <div id="hideType" class="fw-item hide-type">
        <TopoSelect
          :wrapper="'hideType'"
          :hasSearch="false"
          :current="hideTypeOption.select"
          :data="hideTypeOption.data"
          :title="hideTypeOption.title"
          @onChoose="handleChangeHideType"
        />
      </div>
      <!-- 节点状态类型 -->
      <div id="stateType" class="fw-item state-type">
        <TopoSelect
          :wrapper="'stateType'"
          :hasSearch="false"
          :current="stateTypeOption.select"
          :data="stateTypeOption.data"
          :title="stateTypeOption.title"
          @onChoose="handleChangeStateType"
        />
      </div>
      <!-- 关联节点类型 -->
      <div id="relativeType" class="fw-item relative-type">
        <TopoSelect
          :wrapper="'relativeType'"
          :hasSearch="false"
          :current="relativeTypeOption.select"
          :data="relativeTypeOption.data"
          :title="relativeTypeOption.title"
          @onChoose="handleChangeRelativeType"
        />
      </div>
      <!-- 边类型 -->
      <div id="edgeType" class="fw-item edge-type">
        <TopoSelect
          :wrapper="'edgeType'"
          :hasSearch="false"
          :current="edgeTypeOption.select"
          :data="edgeTypeOption.data"
          :title="edgeTypeOption.title"
          @onChoose="handleChangeEdgeType"
        />
      </div>
    </div>
  </div>
</template>

<script lang="js">
  require('./assets/iconfont/iconfont.js');
  import TopoSelect from './topo-select.vue';

  export default {
    data() {
      return {
        inputId: '',
        moreToolState: false,
        hideTypeOption: {
          title: '隐藏节点类型',
          data: [
            {key: 0, label: 'None'},
            {key: 1, label: 'Application'},
            {key: 2, label: 'Process'},
            {key: 3, label: 'Pod'},
            {key: 4, label: 'Node'}
          ],
          select: {key: 0, label: 'None'},
        },
        stateTypeOption: {
          title: '节点状态类型',
          data: [
            {key: 0, label: 'All'},
            {key: 1, label: 'Normal'},
            {key: 2, label: 'Event'}
          ],
          select: {key: 0, label: 'All'}
        },
        relativeTypeOption: {
          title: '关联节点类型',
          data: [
            {key: 0, label: 'Single Hop'},
            {key: 1, label: 'All'},
            {key: 2, label: 'Up Stream'},
            {key: 3, label: 'Down Stream'},
          ],
          select: {key: 0, label: 'Single Hop'}
        },
        edgeTypeOption: {
          title: '边类型',
          data: [
            {key: 0, label: 'All'},
            {key: 1, label: 'Traceing To'},
            {key: 2, label: 'Created On'},
          ],
          select: {key: 0, label: 'All'}
        }
      }
    },

    components: {
      TopoSelect
    },

    methods: {
      handleSearchOnId() {
        if (this.inputId === '') {
          return;
        }
        console.log('handleSearchOnId');
      },

      handleClearInputId() {
        this.inputId = '';
        console.log('handleClearInputId');
      },

      handleEnlargeTopo() {
        console.log('handleEnlargeTopo');
      },

      handleNarrowTopo() {
        console.log('handleNarrowTopo');
      },

      handleRestoreTopo() {
        console.log('handleRestoreTopo');
      },

      handleToggleMoreTool() {
        this.moreToolState = !this.moreToolState;
      },

      handleChangeHideType(select) {
        this.hideTypeOption.select = select;
      },

      handleChangeStateType(select) {
        this.stateTypeOption.select = select;
      },

      handleChangeRelativeType(select) {
        this.relativeTypeOption.select = select;
      },

      handleChangeEdgeType(select) {
        this.edgeTypeOption.select = select;
      }
    }
  }
</script>

<style lang="scss">
  .topo-tool-set {
    position: absolute;
    right: 2px;
    top: 2px;
    height: 40px;
    padding-left: 10px;
    border-radius: 2px;
    background-color: #242424;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .search-wrapper,
    .size-controller,
    .more-tool-btn {
      margin-right: 12px;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .topo-icon {
      margin-right: 5px;
      width: 18px;
      height: 18px;
      overflow: hidden;
      fill: currentColor;
      color: #efeff1;

      &:hover {
        cursor: pointer;
      }

      &.restore {
        margin-right: 0px;
      }
    }

    .search-wrapper {
      position: relative;

      .sw-input {
        width: calc(100% - 4px);
        height: 32px;
        line-height: 32px;
        border: 0;
        background-color: #333840;
        // border: 1px solid  #eee;
        // background-color: transparent;
        color: #eee;
        outline: 0;
        padding: 4px 25px;
        border-radius: 4px;
      }

      span {
        height: 100%;
        display: flex;
        align-items: center;
        position: absolute;
        top: 0;
        color: #efeff1;
        font-size: 16px;

        svg {
          width: 16px;
          height: 16px;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .sw-search {
        left: 5px;
      }

      .sw-clear {
        right: 10px;
      }
    }

    // .size-controller {

    // }

    .more-tool-btn {
      margin-right: 10px;
    }

    .more-tool-wrapper {
      position: absolute;
      top: 100%;
      right: 0;
      padding: 8px 10px;
      margin-top: 8px;
      width: 180px;
      background-color: #242424;
      border-radius: 2px;
      -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

      &:after {
        bottom: 100%;
        right: 15px;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border-color: transparent;
        border-bottom-color: #242424;
        border-width: 8px;
        margin-right: 0;
      }

      .fw-item {
        width: 100%;
        color: #ddd;
        position: relative;
        z-index: 9998;
      }
    }
  }
</style>
