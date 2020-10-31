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
      <div id="hideSomeType" class="fw-item hide-some-type">
        <TopoSelect
          :wrapper="'hideSomeType'"
          :hasSearch="false"
          :current="selectNodeType"
          :data="nodeTypes"
          :title="nodeTypeFilterName"
          @onChoose="handleChangeNodeType"
        />
      </div>
      <!-- 关联节点类型 -->
      <div id="showSomeAssociated" class="fw-item show-some-associated">
        <TopoSelect
          :wrapper="'showSomeAssociated'"
          :hasSearch="false"
          :current="selectAssociatedType"
          :data="associatedTypes"
          :title="associatedTypeFilterName"
          @onChoose="handleChangeAssociatedType"
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
        selectNodeType: {key: 0, label: 'None'},
        nodeTypes: [
          {key: 0, label: 'None'},
          {key: 1, label: 'Application'},
          {key: 2, label: 'Process'},
          {key: 3, label: 'Pod'},
          {key: 4, label: 'Node'}
        ],
        nodeTypeFilterName: '隐藏节点类型',
        selectAssociatedType: {key: 0, label: 'Single Hop'},
        associatedTypes: [
          {key: 0, label: 'Single Hop'},
          {key: 1, label: 'Up All'},
          {key: 2, label: 'Up Event'},
          {key: 3, label: 'Down All '},
          {key: 4, label: 'Down Event'},
          {key: 5, label: 'Up Down All'},
          {key: 6, label: 'Up Down Event'},
        ],
        associatedTypeFilterName: '关联节点类型',
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }],
        value: ''
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

      handleChangeNodeType(selectNodeType) {
        this.selectNodeType = selectNodeType;
      },

      handleChangeAssociatedType(selectAssociatedType) {
        this.selectAssociatedType = selectAssociatedType;
      },
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
