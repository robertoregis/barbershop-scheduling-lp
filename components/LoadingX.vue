<script lang="ts">
    import { useTheme } from '@/stores/theme';
    export default {
        props: {
            width: {
                type: Number,
                required: true
            },
            height: {
                type: Number,
                required: true
            }
        },
        setup(props) {
            const theme = useTheme()
            const width = toRef(props, 'width')
            const height = toRef(props, 'height')

            return {
                width,
                height,
                theme
            }
        }
    }
</script>
<template>
    <div :class="`bg-${theme.color}`" class="c-loader" :style="`width: ${width}px; height: ${height}px;`"></div>
</template>
<style lang="scss" scoped>
    .c-loader {
        animation: is-rotating 1s infinite;
        border: 20px solid #e5e5e5;
        border-radius: 50%;
    }

    @keyframes is-rotating {
        to {
            transform: rotate(1turn);
        }
    }
</style>