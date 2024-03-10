<script lang="ts">
    export default {
        props: {
            title: {
                type: String,
                required: true
            },
            padding: {
                type: String,
                required: true
            }
        },
        setup(props) {
            const title = toRef(props, 'title')
            const padding = toRef(props, 'padding')
            const loading = ref<boolean>(false)

            onMounted(() => {
                setTimeout(() => {
                    loading.value = true
                }, 500)
            })

            return {
                title,
                loading,
                padding
            }
        }
    }
</script>
<template>
    <div v-if="loading" class="flex justify-center">
        <div class="bg-neutral-600 text-white w-[80%] md:w-[500px] rounded shadow-lg">
            <div class="flex">
                <div class="w-[25%] flex justify-center items-center border-r-1 border-white" :class="padding">
                    <Icon name="mdi:close-box" class="text-3xl" />
                </div>
                <div class="w-[75%] flex justify-center items-center" :class="padding">
                    <span class="text-[0.9rem] lg:text-[1rem]">{{ title }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    
</style>