<template>
    <h3>属性编辑区域</h3>
    <div v-for="(item, index) in compData" :key="index">
        <component :is="item.configComType" v-model="item.value"></component>
    </div>
</template>
<script setup>
const compData = defineModel()
</script>
