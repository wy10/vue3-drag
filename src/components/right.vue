<template>
    <div v-for="(item, index) in compData" :key="index">
        <component :is="item.configComType" v-model="item.value"></component>
    </div>
</template>
<script setup>
const compData = defineModel()
</script>
