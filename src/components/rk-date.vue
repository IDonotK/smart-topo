<template>
  <div
    :class="{
      datepicker: true,
      'datepicker-range': range,
      datepicker__clearable: clearable && text && !disabled,
    }"
  >
    <input
      v-if="type !== 'inline'"
      readonly
      :value="text"
      :class="['cp', show ? 'focus' : '', inputClass]"
      :disabled="disabled"
      :placeholder="placeholder"
      :name="name"
    />
    <a class="datepicker-close" @click.stop="cls"></a>
    <transition name="datepicker-anim">
      <div
        v-if="show || type === 'inline'"
        :class="[
          'datepicker-popup',
          popupClass,
          { 'datepicker-inline': type === 'inline' },
          position === 'top' ? 'top' : 'bottom',
        ]"
        tabindex="-1"
      >
        <template v-if="range">
          <div class="datepicker-popup__sidebar">
            <button type="button" class="datepicker-popup__shortcut" @click="quickPick('oneMinute')">
              {{ local.oneMinuteCutTip }}
            </button>
            <button type="button" class="datepicker-popup__shortcut" @click="quickPick('tenMinutes')">
              {{ local.tenMinutesCutTip }}
            </button>
            <button type="button" class="datepicker-popup__shortcut" @click="quickPick('thirtyMinutes')">
              {{ local.thirtyMinutesCutTip }}
            </button>
            <button type="button" class="datepicker-popup__shortcut" @click="quickPick('oneHour')">
              {{ local.oneHourCutTip }}
            </button>
          </div>
          <div class="datepicker-popup__body">
            <rk-calendar v-model="dates[0]" :left="true"></rk-calendar>
            <rk-calendar v-model="dates[1]" :right="true"></rk-calendar>
            <div class="clear"></div>
          </div>
        </template>
        <template v-else>
          <rk-calendar v-model="dates[0]"></rk-calendar>
        </template>
        <div class="datepicker__tips">
          <span v-show="timeRangeMax" class="rk-time-tips">{{ $t('rrkDate_timeRange_max') }}</span>
          <span v-show="timeRangeMin" class="rk-time-tips">{{ $t('rrkDate_timeRange_min') }}</span>
        </div>
        <div v-if="showButtons" class="datepicker__buttons">
          <button class="datepicker__button-cancel" @click.prevent.stop="cancel">
            {{ local.cancelTip }}
          </button>
          <button
            class="datepicker__button-select"
            :disabled="timeRangeMax || timeRangeMin"
            @click.prevent.stop="submit"
          >
            {{ local.submitTip }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="js">
import RkCalendar from './rk-date-calendar.vue';
import getLocalTime from '@/utils/localtime';
export default {
  name: 'VueDatepickerLocal',
  components: { RkCalendar },
  props: {
    position: { type:String, default:'bottom' },
    name: [String],
    inputClass: [String],
    popupClass: [String],
    value: [Date, Array, String],
    disabled: [Boolean],
    type: {
      type: String,
      default: 'normal',
    },
    rangeSeparator: {
      type: String,
      default: '~',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    placeholder: [String],
    disabledDate: {
      type: Function,
      default: () => false,
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    showButtons: {
      type: Boolean,
      default: false,
    },
    dateRangeSelect: [Function],
  },
  data() {
    return {
      show: false,
      dates: [],
      timeRangeMax: false,
      timeRangeMin: false,
      datesBackup: null,
    };
  },
  computed: {
    local() {
      return {
        dow: 1,
        hourTip: this.$t('rkDate_pickOption_hour'),
        minuteTip: this.$t('rkDate_pickOption_minute'),
        secondTip: this.$t('rkDate_pickOption_second'),
        yearSuffix: this.$t('rkDate_year_suffix'),
        monthsHead: this.$t('rkDate_months_head').split('_'),
        months: this.$t('rkDate_months').split('_'),
        weeks: this.$t('rkDate_weeks').split('_'),
        cancelTip: this.$t('cancel'),
        submitTip: this.$t('confirm'),
        oneMinuteCutTip: this.$t('rkDate_quickOption_recentOneMinute'),
        tenMinutesCutTip: this.$t('rkDate_quickOption_recentTenMinutes'),
        thirtyMinutesCutTip: this.$t('rkDate_quickOption_recentThirtyMinutes'),
        oneHourCutTip: this.$t('rkDate_quickOption_recentOneHour'),
      };
    },
    range() {
      return this.dates.length === 2;
    },
    text() {
      const val = this.value;
      const txt = this.dates
        .map(date => this.tf(date))
        .join(` ${this.rangeSeparator} `);
      if (Array.isArray(val)) {
        return val.length > 1 ? txt : '';
      }
      return val ? txt : '';
    },
  },
  watch: {
    value() {
      this.dates = this.vi(this.value);
    },
    show(newVal) {
      if (newVal) {
        this.datesBackup = this.deepClone(this.dates);
        this.$store.commit('rocketTopo/SET_IS_AUTO_RELOAD_TOPO', false);
      }
    },
    dates(val) {
      this.timeRangeMax = val[1].getTime() - val[0].getTime() > 24 * 60 * 60 * 1000;
      this.timeRangeMin = val[1].getTime() - val[0].getTime() < 30 * 1000;
    }
  },
  mounted() {
    this.dates = this.vi(this.value);
    document.addEventListener('click', this.dc, true);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.dc, true);
  },
  methods: {
    get(dates) {
      return Array.isArray(this.value) ? dates : dates[0];
    },
    cls() {
      this.$emit('clear');
      this.$emit('input', this.range ? [] : '');
    },
    vi(val) {
      if (Array.isArray(val)) {
        return val.length > 1
          ? val.map(item => new Date(item))
          : [new Date(), new Date()];
      }
      return val ? [new Date(val)] : [new Date()];
    },
    ok(leaveOpened) {
      this.$emit('input', this.get(this.dates));
      !leaveOpened &&
        !this.showButtons &&
        setTimeout(() => {
          this.show = this.range;
        });
    },
    tf(time, format) {
      const year = time.getFullYear();
      const month = time.getMonth();
      const day = time.getDate();
      const hours24 = time.getHours();
      const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();
      const milliseconds = time.getMilliseconds();
      const dd = t => (`0${t}`).slice(-2);
      const map = {
        YYYY: year,
        MM: dd(month + 1),
        MMM: this.local.months[month],
        MMMM: this.local.monthsHead[month],
        M: month + 1,
        DD: dd(day),
        D: day,
        HH: dd(hours24),
        H: hours24,
        hh: dd(hours),
        h: hours,
        mm: dd(minutes),
        m: minutes,
        ss: dd(seconds),
        s: seconds,
        S: milliseconds,
      };
      return (format || this.format).replace(
        /Y+|M+|D+|H+|h+|m+|s+|S+/g,
        str => map[str],
      );
    },
    dc(e) {
      if (!this.$el.contains(e.target) && this.show && this.datesBackup) {
        this.dates = this.deepClone(this.datesBackup);
      }
      this.show = this.$el.contains(e.target) && !this.disabled;
    },
    validateTime() {
      return !(this.timeRangeMax || this.timeRangeMin);
    },
    quickPick(type){
      const end = new Date();
      const start = new Date();
      switch (type) {
        case 'oneMinute':
          start.setTime(start.getTime() - 60 * 1000);
          break;
        case 'tenMinutes':
          start.setTime(start.getTime() - 10 * 60 * 1000);
          break;
        case 'thirtyMinutes':
          start.setTime(start.getTime() - 30 * 60 * 1000);
          break;
        case 'oneHour':
          start.setTime(start.getTime() - 60 * 60 * 1000);
          break;
        default:
          break;
      }
      this.dates = [start, end];
      this.$emit('input', this.get(this.dates));
      this.show = false;
    },
    submit() {
      this.$emit('input', this.get(this.dates));
      this.show = false;
    },
    cancel() {
      this.dates = this.deepClone(this.datesBackup);
      this.show = false;
    },
    deepClone (obj) {
      let objClone = Array.isArray(obj) ? [] : {}
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] && typeof obj[key] === 'object') {
              if (obj[key] instanceof Date) {
                objClone[key] = new Date(obj[key].valueOf())
              } else { objClone[key] = this.deepClone(obj[key]) }
            } else {
              objClone[key] = obj[key]
            }
          }
        }
      } return objClone
    },
  },
};
</script>

<style lang="scss" scoped>
.datepicker {
    display: inline-block;
    position: relative;
    color: #ddd;
}

.datepicker-icon {
    display: block;
    position: absolute;
    top: 8px;
    left: 8px;
    color: #515a6ecc;
}

.datepicker-close {
    display: none;
    position: absolute;
    width: 34px;
    height: 100%;
    top: 0;
    right: 0;
    cursor: pointer;
}

.datepicker-close::before {
    display: block;
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 50%;
    top: 50%;
    margin-left: -8px;
    margin-top: -8px;
    text-align: center;
    color: #fff;
    border-radius: 50%;
    background:
        #ccc
        url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3IDciIHdpZHRoPSI3IiBoZWlnaHQ9IjciPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik01LjU4LDVsMi44LTIuODFBLjQxLjQxLDAsMSwwLDcuOCwxLjZMNSw0LjQxLDIuMiwxLjZhLjQxLjQxLDAsMCwwLS41OC41OGgwTDQuNDIsNSwxLjYyLDcuOGEuNDEuNDEsMCwwLDAsLjU4LjU4TDUsNS41OCw3LjgsOC4zOWEuNDEuNDEsMCwwLDAsLjU4LS41OGgwWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEuNSAtMS40OCkiIHN0eWxlPSJmaWxsOiNmZmYiLz48L3N2Zz4NCg==')
        no-repeat 50% 50%;
}

.datepicker__clearable:hover::before {
    display: none;
}

.datepicker__clearable:hover .datepicker-close {
    display: block;
}

.datepicker-close:hover::before {
    background-color: #afafaf;
}

.datepicker > input {
    color: inherit;
    // transition: all 200ms ease;
    border-radius: 4px;
    border: 0;
    background: none;
    height: 28px;
    box-sizing: border-box;
    outline: none;
    padding: 0 5px;
    width: 100%;
    user-select: none;
    font-family: Monaco, sans-serif;
    letter-spacing: -0.7px;
}

.datepicker > input.focus {
    border-color: #3f97e3;
    -webkit-box-shadow: 0 0 5px rgba(59, 180, 242, 0.3);
    box-shadow: 0 0 5px rgba(59, 180, 242, 0.3);
}

.datepicker > input:disabled {
    cursor: not-allowed;
    background-color: #ebebe4;
    border-color: #e5e5e5;
    -webkit-box-shadow: none;
    box-shadow: none;
}

.datepicker-popup {
    width: 500px;
    left: 0;
    border-radius: 4px;
    position: absolute;
    transition: all 200ms ease;
    opacity: 1;
    transform: scaleY(1);
    font-size: 12px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(99, 99, 99, 0.2);
    margin-top: 2px;
    outline: 0;
    padding: 5px;
    overflow: hidden;
    z-index: 999;

    &.top {
        bottom: 35px;
        transform-origin: center bottom;
    }

    &.bottom {
        top: 35px;
        transform-origin: center top;
    }

    &__sidebar {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 80px;
        height: 100%;
        padding: 5px;
        border-right: solid 1px #eaeaea;
    }

    &__shortcut {
        display: block;
        width: 100%;
        border: 0;
        background-color: transparent;
        line-height: 34px;
        font-size: 12px;
        color: #666;
        text-align: left;
        outline: none;
        cursor: pointer;
        white-space: nowrap;

        &:hover {
            color: #3f97e3;
        }
    }

    &__body {
        padding-left: 85px;

        .clear {
            clear: both;
        }
    }
}

.datepicker-inline {
    position: relative;
    margin-top: 0;
}

.datepicker-range {
    min-width: 256px;
}

.datepicker-bottom {
    float: left;
    width: 100%;
    text-align: right;
}

.datepicker-btn {
    padding: 5px 10px;
    background: #3f97e3;
    color: #fff;
    border-radius: 2px;
    display: inline-block;
    cursor: pointer;
}

.datepicker-anim-enter-active {
    transform-origin: 0 0;
    animation: datepicker-anim-in 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.datepicker-anim-leave-active {
    transform-origin: 0 0;
    animation: datepicker-anim-out 0.2s cubic-bezier(0.755, 0.05, 0.855, 0.06);
}

.datepicker__tips {
    margin: 8px 5px;
    text-align: left;
    padding-left: 80px;

    .rk-time-tips {
        color: red;
    }
}

.datepicker__buttons {
    display: block;
    text-align: right;
}

.datepicker__buttons button {
    display: inline-block;
    font-size: 13px;
    border: none;
    cursor: pointer;
    margin: 5px 0 0 5px;
    padding: 5px 15px;
    color: #fff;
    border-radius: 3px;

    // &[disabled]{
    //   opacity: 0.5;
    // }
}

.datepicker__buttons .datepicker__button-select {
    background: #3f97e3;
}

.datepicker__buttons .datepicker__button-cancel {
    background: #666;
}

@keyframes datepicker-anim-in {
    0% {
        opacity: 0;
        transform: scaleY(0.8);
    }

    to {
        opacity: 1;
        transform: scaleY(1);
    }
}

@keyframes datepicker-anim-out {
    0% {
        opacity: 1;
        transform: scaleY(1);
    }

    to {
        opacity: 0;
        transform: scaleY(0.8);
    }
}
</style>
