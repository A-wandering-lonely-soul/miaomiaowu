<template>
  <div class="ai-chart-block" ref="chartEl">
    <p v-if="error" class="ai-block-error">图表解析失败：{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { safeParseJson } from '@/utils/structuredParser'
import type { ChartData } from '@/utils/structuredParser'

echarts.use([BarChart, LineChart, GridComponent, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  rawJson: string
  dark?: boolean
}>()

const chartEl = ref<HTMLElement | null>(null)
const error = ref('')
let instance: echarts.ECharts | null = null

function buildOption(data: ChartData): echarts.EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    title: data.title ? { text: data.title, textStyle: { fontSize: 13 } } : undefined,
    tooltip: { trigger: 'axis' },
    legend: {
      data: data.series.map((s) => s.name),
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 10, right: 10, top: data.title ? 36 : 16, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: data.xAxis, axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 12 } },
    series: data.series.map((s) => ({
      name: s.name,
      type: data.type ?? 'bar',
      data: s.data,
      smooth: data.type === 'line',
    })),
  }
}

function render() {
  if (!chartEl.value) return
  const data = safeParseJson<ChartData>(props.rawJson)
  if (!data || !Array.isArray(data.xAxis) || !Array.isArray(data.series)) {
    error.value = '无效的 chart JSON'
    return
  }
  error.value = ''
  if (!instance) {
    instance = echarts.init(chartEl.value, props.dark ? 'dark' : undefined)
  }
  instance.setOption(buildOption(data))
}

onMounted(() => render())

watch(() => props.dark, () => {
  instance?.dispose()
  instance = null
  render()
})

watch(() => props.rawJson, () => {
  render()
})

onUnmounted(() => {
  instance?.dispose()
  instance = null
})
</script>

<style scoped>
.ai-chart-block {
  width: 100%;
  min-height: 240px;
  height: 260px;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
}
.ai-block-error {
  color: #cf1322;
  font-size: 12px;
  padding: 8px;
}
</style>
