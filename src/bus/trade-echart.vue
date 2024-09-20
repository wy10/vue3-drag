<template>
    <div ref="myChart" autoresize></div>
</template>

<script setup>
import { onMounted, ref, markRaw } from 'vue'
import * as echarts from 'echarts'

const myChart = ref()
const chart = ref()

onMounted(() => {
    chart.value = markRaw(echarts.init(myChart.value)) // 初始化echarts实例
    const option = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                smooth: true,
            },
        ],
    }
    // 设置实例参数
    chart.value.setOption(option)
})

defineExpose({
    chart,
})
</script>
