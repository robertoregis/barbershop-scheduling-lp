<template>
    <div class="flex">
        <div :class="`hover-bg-${theme.color} hover-my-text-${theme.color}`" class="bg-white shadow-lg rounded py-1 px-3 flex items-center">
            <span class="font-weight-500">Resultado total:</span>
            <span class="font-weight-600 ml-3 text-lg">{{  result > 0 ? result : 0 }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { useTheme } from '@/stores/theme'
export default {
    props: {
        result: {
            type: Number || String,
            required: true
        }
    },
    setup(props) {
        const theme = useTheme()
        const result = toRef(props, "result")

        return {
            result,
            theme
        }
    }
}
</script>
<style lang="scss" scoped>
    
</style>