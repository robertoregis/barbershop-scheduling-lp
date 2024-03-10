<script lang="ts">
    export default {
        
    }
</script>
<template>
    <div class="fixed bg-gray-700/50 inset-0 w-screen h-screen overflow-auto" id="ModalDataLoading" style="z-index: 10000;">
        <div class="flex justify-center items-center" style="min-height: calc(100% - 3.5rem); margin: 1.75rem auto;">
            <Loading />
        </div>
    </div>
</template>
<style lang="scss" scoped>
    body {
        overflow: hidden;
    }
</style>