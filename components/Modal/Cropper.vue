<script lang="ts">
    export default {
        props: {
            modalId: {
                type: String,
                required: true
            },
            aspectRatio: {
                type: Number,
                required: true
            }
        },
        setup(props, {emit}) {
            const modalId = toRef(props, 'modalId')
            const aspectRatio = toRef(props, 'aspectRatio')
            const loading = ref<boolean>(true)

            const myWindow = ref<object | any>({
                width: null,
                height: null
            })
            const height = computed(() => {
                if(myWindow.value) {
                    if(myWindow.value.height >= 500) {
                        let result = (myWindow.value.height / 100) * 70
                        return `${result}px`
                    } else {
                        let result = (myWindow.value.height / 100) * 80
                        return `${result}px`
                    }
                }
            });
            const getWindow = () => {
                myWindow.value.width = window.innerWidth
                myWindow.value.height = window.innerHeight
            }
            const closeModal = () => {
                let modalCropper:any = document.querySelector(`#${modalId.value}`)
                document.body.style.overflow = 'auto'
                if(modalCropper) {
                    modalCropper.style.display = "none"
                }
            }
            const getFileCropper = (file: any) => {
                emit('send-file-cropper', file)
                setTimeout(() => {
                    closeModal()
                }, 1500)
            }
            // cíclos de vida
            onMounted(async () => {
                nextTick(() => {
                    getWindow()
                })
                window.addEventListener('resize', getWindow)
                setTimeout(() => {
                    loading.value = false
                }, 2000)
            })
            return {
                modalId,
                closeModal,
                loading,
                height,
                getFileCropper,
                aspectRatio
            }
        }
    }
</script>
<template>
    <div v-if="!loading" class="fixed bg-gray-700/50 inset-0 w-screen h-screen overflow-auto" id="ModalCropper" style="z-index: 10000;">
        <div @click.self.prevent="closeModal" class="flex justify-center items-center" style="min-height: calc(100% - 3.5rem); margin: 1.75rem auto;">
            <div class="bg-white flex shadow-lg shadow-gray-700 rounded-xl overflow-auto pt-4 pb-6 px-4 table w-[90%] sm:w-[80%] lg-min-w-[600px] lg:max-w-[800px] border-1 border-transparent focus:border-1 focus:border-color1" role="dialog" tabindex="0" id="componentModalCropper">
                <div class="grid grid-cols-12 w-full">
                    <div class="col-span-12">
                        <div class="flex justify-end">
                            <button @click="closeModal" class="btn px-1 py-0 border-2 border-transparent focus:border-neutral-700/50 rounded">
                                <Icon name="ci:close-big" class="text-3xl" />
                            </button>
                        </div>
                    </div>
                    <div class="col-span-12 border-2 border-gray-300 py-3 px-2 rounded mt-2">
                        <MasterCropper @send-file="getFileCropper" :aspect="aspectRatio" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    body {
        overflow: hidden;
    }
    #ModalCropper {
        display: none;
    }
</style>