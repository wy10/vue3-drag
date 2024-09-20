<template>
    <el-table
        :data="tableData"
        style="width: 100%"
        :row-style="{ height: '20px' }"
        :cell-style="{ padding: '0px' }"
    >
        <el-table-column prop="date" label="Date" width="180" />
        <el-table-column prop="name" label="Name" width="180" />
        <el-table-column prop="address" label="Address" />
    </el-table>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
    filter: {},
})

const data = ref(
    Array.from({ length: 30 }, (_, index) => ({
        date: `2016-05-${index}`,
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    })),
)

const tableData = computed(() => {
    return data.value.slice(0, props.filter.rows.value)
})
</script>

<style lang="less">
.height {
    line-height: 30px !important;
}
</style>
