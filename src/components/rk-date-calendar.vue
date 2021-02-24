<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div :class="`${pre}`">
    <div :class="`${pre}-head`">
      <a v-show="showYears" :class="`${pre}-prev-decade-btn`" @click="year -= 10"
        ><svg class="icon sm cp">
          <use xlink:href="#angle-double-left"></use></svg
      ></a>
      <a v-show="!showYears" :class="`${pre}-prev-year-btn`" @click="year--"
        ><svg class="icon sm cp">
          <use xlink:href="#angle-double-left"></use></svg
      ></a>
      <a v-show="!showYears && !showMonths" :class="`${pre}-prev-month-btn`" @click="pm">
        <svg class="icon lg cp">
          <use xlink:href="#chevron-left"></use></svg
      ></a>
      <a v-show="showYears" :class="`${pre}-year-select`">{{ ys + '-' + ye }}</a>
      <template v-if="local.yearSuffix">
        <a v-show="!showYears" :class="`${pre}-year-select`" @click="showYears = !showYears"
          >{{ year }}{{ local.yearSuffix }}</a
        >
        <a v-show="!showYears && !showMonths" :class="`${pre}-month-select`" @click="showMonths = !showMonths">{{
          local.monthsHead[month]
        }}</a>
      </template>
      <template v-else>
        <a v-show="!showYears && !showMonths" :class="`${pre}-month-select`" @click="showMonths = !showMonths">{{
          local.monthsHead[month]
        }}</a>
        <a v-show="!showYears" :class="`${pre}-year-select`" @click="showYears = !showYears">{{ year }}</a>
      </template>
      <a v-show="!showYears && !showMonths" :class="`${pre}-next-month-btn`" @click="nm">
        <svg class="icon lg cp">
          <use xlink:href="#chevron-right"></use></svg
      ></a>
      <a v-show="!showYears" :class="`${pre}-next-year-btn`" @click="year++"
        ><svg class="icon sm cp">
          <use xlink:href="#angle-double-right"></use></svg
      ></a>
      <a v-show="showYears" :class="`${pre}-next-decade-btn`" @click="year += 10"
        ><svg class="icon sm cp">
          <use xlink:href="#angle-double-right"></use></svg
      ></a>
    </div>
    <div :class="`${pre}-body`">
      <div :class="`${pre}-days`">
        <a v-for="i in local.weeks" :key="i" :class="`${pre}-week`">{{ i }}</a>
        <a
          v-for="(j, i) in days"
          :key="i"
          :class="[
            j.p || j.n ? `${pre}-date-out` : '',
            status({ year: j.y, month: j.m, day: j.i, hour: hour, minute: minute, second: second }, 'YYYYMMDD'),
          ]"
          @click="is($event) && ((day = j.i), ok(j))"
          >{{ j.i }}</a
        >
      </div>
      <div v-show="showMonths" :class="`${pre}-months`">
        <a
          v-for="(i, j) in local.months"
          :key="j"
          :class="[status({ year: year, month: j, day: day, hour: hour, minute: minute, second: second }, 'YYYYMM')]"
          @click="is($event) && ((showMonths = m === 'M'), (month = j), m === 'M' && ok('m'))"
          >{{ i }}</a
        >
      </div>
      <div v-show="showYears" :class="`${pre}-years`">
        <a
          v-for="(i, j) in years"
          :key="j"
          :class="[
            j === 0 || j === 11 ? `${pre}-date-out` : '',
            status({ year: i, month: month, day: day, hour: hour, minute: minute, second: second }, 'YYYY'),
          ]"
          @click="is($event) && ((showYears = m === 'Y'), (year = i), m === 'Y' && ok('y'))"
          >{{ i }}</a
        >
      </div>
      <div v-show="showHours" :class="`${pre}-hours scroll_hide`">
        <div :class="`${pre}-title`">{{ local.hourTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 24"
            :key="i"
            :class="[
              status({ year: year, month: month, day: day, hour: i, minute: minute, second: second }, 'YYYYMMDDHH'),
            ]"
            @click="is($event) && ((showHours = false), (hour = i), ok('h'))"
            >{{ i }}</a
          >
        </div>
      </div>
      <div v-show="showMinutes" :class="`${pre}-minutes`">
        <div :class="`${pre}-title`">{{ local.minuteTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 60"
            :key="i"
            :class="[
              status({ year: year, month: month, day: day, hour: hour, minute: i, second: second }, 'YYYYMMDDHHmm'),
            ]"
            @click="is($event) && ((showMinutes = false), (minute = i), ok('h'))"
            >{{ i }}</a
          >
        </div>
      </div>
      <div v-show="showSeconds" :class="`${pre}-seconds`">
        <div :class="`${pre}-title`">{{ local.secondTip }}</div>
        <div class="scroll_hide calendar-overflow">
          <a
            v-for="(j, i) in 60"
            :key="i"
            :class="[
              status({ year: year, month: month, day: day, hour: hour, minute: minute, second: i }, 'YYYYMMDDHHmmss'),
            ]"
            @click="is($event) && ((showSeconds = false), (second = i), ok('h'))"
            >{{ i }}</a
          >
        </div>
      </div>
    </div>
    <div v-if="m === 'H'" :class="`${pre}-foot`">
      <div :class="`${pre}-hour`">
        <a
          :title="local.hourTip"
          :class="{ on: showHours }"
          @click="(showHours = !showHours), (showMinutes = showSeconds = false)"
          >{{ hour | dd }}</a
        >
        <span>:</span>
        <a
          :title="local.minuteTip"
          :class="{ on: showMinutes }"
          @click="(showMinutes = !showMinutes), (showHours = showSeconds = false)"
          >{{ minute | dd }}</a
        >
        <span>:</span>
        <a
          :title="local.secondTip"
          :class="{ on: showSeconds }"
          @click="(showSeconds = !showSeconds), (showHours = showMinutes = false)"
          >{{ second | dd }}</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'VueDatepickerLocalCalendar',
  filters: {
    dd: val => (`0${  val}`).slice(-2),
  },
  props: {
    value: { default: null },
    left: { default: false },
    right: { default: false },
  },
  data() {
    const get = (time) => ({
        year: time.getFullYear(),
        month: time.getMonth(),
        day: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
      });
    const time = get(this.value);
    return {
      pre: 'calendar',
      m: 'D',
      showYears: false,
      showMonths: false,
      showHours: false,
      showMinutes: false,
      showSeconds: false,
      year: time.year,
      month: time.month,
      day: time.day,
      hour: time.hour,
      minute: time.minute,
      second: time.second,
    };
  },
  computed: {
    local() {
      return this.$parent.local;
    },
    format() {
      return this.$parent.format;
    },
    start() {
      return this.parse(this.$parent.dates[0]);
    },
    end() {
      return this.parse(this.$parent.dates[1]);
    },
    ys() {
      return Math.floor(this.year / 10) * 10;
    },
    ye() {
      return this.ys + 10;
    },
    years() {
      const arr = [];
      let start = this.ys - 1;
      while (arr.length < 12) {
        arr.push(start += 1);
      }
      return arr;
    },
    days() {
      const days = [];
      const year = this.year;
      const month = this.month;
      const time = new Date(year, month, 1);
      const dow = this.local.dow || 7;
      time.setDate(0); // switch to the last day of last month
      let lastDay = time.getDate();
      const week = time.getDay() || 7;
      let count = dow <= week ? week - dow + 1 : week + (7 - dow + 1);
      while (count > 0) {
        days.push({
          i: lastDay - count + 1,
          y: month > 0 ? year : year - 1,
          m: month > 0 ? month - 1 : 11,
          p: true,
        });
        count--;
      }
      time.setMonth(time.getMonth() + 2, 0); // switch to the last day of the current month
      lastDay = time.getDate();
      let i = 1;
      for (i = 1; i <= lastDay; i++) {
        days.push({
          i,
          y: year,
          m: month,
        });
      }
      for (i = 1; days.length < 42; i++) {
        days.push({
          i,
          y: month < 11 ? year : year + 1,
          m: month < 11 ? month + 1 : 0,
          n: true,
        });
      }
      return days;
    },
  },
  watch: {
    value(val) {
      const time = this.get(val);
      this.year = time.year;
      this.month = time.month;
      this.day = time.day;
      this.hour = time.hour;
      this.minute = time.minute;
      this.second = time.second;
    },
  },
  mounted() {
    const is = c => this.format.indexOf(c) !== -1;
    if (is('s') && is('m') && (is('h') || is('H'))) {
      this.m = 'H';
    } else if (is('D')) {
      this.m = 'D';
    } else if (is('M')) {
      this.m = 'M';
      this.showMonths = true;
    } else if (is('Y')) {
      this.m = 'Y';
      this.showYears = true;
    }
  },
  methods: {
    get(time) {
      return {
        year: time.getFullYear(),
        month: time.getMonth(),
        day: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
      };
    },
    parse(num) {
      return Math.floor(num / 1000);
    },
    status({year, month, day, hour, minute, second}, format) {
      const maxDay = new Date(year, month + 1, 0).getDate();
      const time = new Date(
        year,
        month,
        day > maxDay ? maxDay : day,
        hour,
        minute,
        second
      );
      const t = this.parse(time);
      const f = this.$parent.tf;
      const classObj = {};
      let flag = false;
      if (format === 'YYYY') {
        flag = year === this.year;
      } else if (format === 'YYYYMM') {
        flag = month === this.month;
      } else {
        flag = f(this.value, format) === f(time, format);
      }
      classObj[`${this.pre}-date`] = true;
      classObj[`${this.pre}-date-disabled`] =
        (this.right && t < this.start) ||
        this.$parent.disabledDate(time, format);
      classObj[`${this.pre}-date-on`] =
        (this.left && t > this.start) || (this.right && t < this.end);
      classObj[`${this.pre}-date-selected`] = flag;
      return classObj;
    },
    nm() {
      if (this.month < 11) {
        this.month++;
      } else {
        this.month = 0;
        this.year++;
      }
    },
    pm() {
      if (this.month > 0) {
        this.month--;
      } else {
        this.month = 11;
        this.year--;
      }
    },
    is(e) {
      return e.target.className.indexOf(`${this.pre}-date-disabled`) === -1;
    },
    ok(info) {
      let year = '';
      let month = '';
      let day = '';
      info && info.n && this.nm();
      info && info.p && this.pm();
      if (info === 'h') {
        const time = this.get(this.value);
        year = time.year;
        month = time.month;
      } else if (info === 'm' || info === 'y') {
        day = '1';
      }
      const _time = new Date(
        year || this.year,
        month || this.month,
        day || this.day,
        this.hour,
        this.minute,
        this.second
      );
      if (this.left && Math.floor(_time.getTime() / 1000) > this.end) {
        this.$parent.dates[1] = _time;
      }
      this.$emit('input', _time);
      // this.$parent.ok(info === 'h');
    },
  },
};
</script>

<style scoped>
.calendar {
    float: left;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    color: #3d444f;
}

.calendar + .calendar {
    border-left: solid 1px #eaeaea;
    margin-left: 5px;
    padding-left: 5px;
}

.calendar-head {
    line-height: 34px;
    height: 34px;
    text-align: center;
    position: relative;
}

.calendar-head a {
    color: #666;
    cursor: pointer;
    display: inline-block;
    text-align: center;
    position: absolute;
    padding: 0 5px;
    font-size: 16px;
}

.calendar-head .calendar-year-select,
.calendar-head .calendar-month-select {
    font-size: 12px;
    padding: 0 2px;
    position: relative;
}

.calendar-prev-decade-btn,
.calendar-prev-year-btn {
    left: 6px;
}

.calendar-prev-month-btn {
    left: 24px;
}

.calendar-next-decade-btn,
.calendar-next-year-btn {
    right: 6px;
}

.calendar-next-month-btn {
    right: 24px;
}

.calendar-next-month-btn .icon.lg,
.calendar-prev-month-btn .icon.lg {
    margin-top: 8px;
}

.calendar-body {
    position: relative;
    width: 196px;
    height: 196px;
}

.calendar-days {
    width: 100%;
    height: 100%;
}

.calendar-week,
.calendar-date {
    font-weight: normal;
    width: 14.28%;
    height: 14.28%;
    text-align: center;
    box-sizing: border-box;
    overflow: hidden;
    float: left;
}

.calendar-week::before,
.calendar-date::before {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
}

.calendar-date {
    cursor: pointer;
    line-height: 29px;
    transition: background-color 0.3s;
}

.calendar-date-out {
    color: #ccc;
}

.calendar-date:hover,
.calendar-date-on {
    color: #3f97e3;
    background-color: #f8f8f8;
}

.calendar-date-selected,
.calendar-date-selected:hover {
    color: #fff;
    font-weight: bold;
    border-radius: 14px;
    background: #3f97e3;
}

.calendar-date-disabled {
    cursor: not-allowed !important;
    color: #ccc !important;
    background: #fff !important;
}

.calendar-foot {
    margin-top: 5px;
}

.calendar-hour {
    display: inline-block;
    border: 1px solid #e6e5e5;
    color: #9e9e9e;
}

.calendar-hour a {
    display: inline-block;
    padding: 2px 4px;
    cursor: pointer;
}

.calendar-years,
.calendar-months,
.calendar-hours,
.calendar-minutes,
.calendar-seconds {
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
    left: 0;
    top: 0;
}

.calendar-months a {
    width: 33.33%;
    height: 25%;
}

.calendar-years a {
    width: 33.33%;
    height: 25%;
}

.calendar-head a:hover {
    color: #3f97e3;
}

.calendar-hour a:hover,
.calendar-hour a.on {
    color: #3f97e3;
}

.calendar-overflow {
    overflow-x: scroll;
    height: 100%;
}

.calendar-title {
    margin-top: -30px;
    height: 30px;
    line-height: 30px;
    background: #fff;
    text-align: center;
    font-weight: bold;
}
</style>
