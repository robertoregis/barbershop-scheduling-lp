<template>
    <NuxtLink :to="url" class="bg-neutral-700 hover:bg-neutral-600 flex self-start items-center text-white px-4 py-1 rounded no-underline mt-2 md:mt-0 md:mr-2">
        <Icon name="mdi:arrow-bottom-right-bold-box" class="text-xl" />
        <span class="ml-2">{{ title }}</span>
    </NuxtLink>
</template>
<script lang="ts">
    export default {
        props: {
            title: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        },
        setup(props) {
            const title = toRef(props, 'title')
            const url = toRef(props, 'url')

            return {
                title,
                url
            }
        }
    }
</script>
<style lang="scss" scoped>
    
</style>