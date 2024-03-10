<script setup lang="ts">

    const props: any = defineProps({
        error: Object
    })
    const loading = ref<boolean>(true)

    /*const changeHead = async (nickname: string, description: string, favicon: string, mobileicon: string) => {
        console.log(nickname)
        useHead({
            title: nickname,
            meta: [
                {
                    name: 'description',
                    content: 'Olá, encontramos um erro. Sugerimos que volte a página inicial.'
                }
            ],
            link: [
                {
                    title: 'favicon', rel: 'icon', type: 'image/png', href: favicon ? favicon : '/favicon-web-32x32px.png'
                },
                {
                    title: 'mobileicon', rel: 'apple-touch-icon', sizes: '512x512', href: mobileicon ? mobileicon : 'favicon-mobile-512x512px.png'
                }
            ]
        })
    }*/
    const handleError = () => clearError({ redirect: '/' })

    // ciclos de vida
    onMounted(() => {
        loading.value = false
    })

</script>

<template>
    <div v-if="!loading" class="w-screen h-screen flex justify-center items-center bg-gradient-to-r from-gray-900">
        <div class="flex flex-col">
            <div class="grid grid-cols-1">
                <div class="col-span-1">
                    <h1 class="text-center text-xl sm:text-2xl md:text-3xl xl:text-4xl font-semibold" v-if="props.error.statusCode === 404">Página não encontrada!</h1>
                    <h1 v-else class="text-center text-xl sm:text-2xl md:text-3xl xl:text-4xl font-semibold">Aconteceu um erro!</h1>
                </div>
                <div class="col-span-1 mt-4">
                    <div class="flex justify-center w-full">
                        <div class="w-[90%] md:w-[80%] flex flex-col text-center">
                            <span v-if="props.error.statusCode === 404">Não encontramos a página <span class="font-bold">{{props.error.url}}</span></span>
                            <span v-else>Desculpa, aconteceu um  <span class="font-bold">erro</span>.</span>
                            <span>Sugerimos que volte para a página inicial e continue a navegar no site <Icon name="🚀" /></span>
                        </div>
                    </div>
                </div>
                <div class="col-span-1 mt-4">
                    <!--<span>{{props}}</span>-->
                    <div class="flex justify-center">
                        <button class="bg-blue-600 text-white py-2 px-6 rounded" @click="handleError">Voltar a página inicial</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    
</style>