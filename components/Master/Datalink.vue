<script lang="ts">
  import { textSlice } from '../../composables/textFunctions'

  export default {
    props: {
      classFather: {
        type: String,
        required: false
      },
      classChild: {
        type: String,
        required: false
      },
      classGrandChild: {
        type: String,
        required: false
      },
      classIcon: {
        type: String,
        required: false
      },
      isLight: {
        type: Boolean,
        default: false,
        required: false
      },
      arrayOfLinks: {
        type: Array,
        required: true
      },
      isBack: {
        type: Boolean,
        default: false,
        required: false
      }
    },

    setup(props) {
      const classFather = toRef(props, 'classFather')
      const classChild = toRef(props, 'classChild')
      const classGrandChild = toRef(props, 'classGrandChild')
      const classIcon = toRef(props, 'classIcon')
      const isLight = toRef(props, 'isLight')
      const arrayOfLinks: any = toRef(props, 'arrayOfLinks')
      const isBack = toRef(props, 'isBack')

      const backToThePreviusPage = () => {
        window.history.back()
      }

      onMounted(() => {
        ///if(classChild)
      })

      return {
        classFather,
        classChild,
        classGrandChild,
        classIcon,
        isLight,
        arrayOfLinks,
        backToThePreviusPage,
        isBack
      }
    }

  }
</script>

<template>
  <div class="flex flex-col items-start">
    <div :class="{classFather, 'text-white': isLight, 'text-neutral-800': !isLight}" class="flex flex-row flex-wrap items-center">
      <Icon name="ic:baseline-house" class="text-lg md:text-xl mr-1" />
      <template v-for="(item, indice) in arrayOfLinks" :key="indice">
        <NuxtLink v-if="item.link" :title="item.name" :to="item.link"  :class="{classChild, 'text-white': isLight, 'text-neutral-800': !isLight}" class="text-limit mr-1 no-underline"><Icon name="ic:baseline-arrow-right" /><span :class="classGrandChild" class="ml-1 text-sm md:text-base font-medium hover:underline">{{textSlice(item.name, 22)}}</span></NuxtLink>
        <p v-else :title="item.name"  :class="{classChild, 'text-white': isLight, 'text-neutral-800': !isLight}" class="text-limit mr-1 mb-0"><Icon name="ic:baseline-arrow-right" /><span :class="classGrandChild" class="ml-1 text-sm md:text-base font-medium">{{textSlice(item.name, 22)}}</span></p>
      </template>
    </div>
    <a v-if="isBack" @click.prevent="backToThePreviusPage" href=""  class="rounded flex justify-center items-center no-underline bg-orange-800 px-3 text-white mt-1" style="z-index: 1000">
        <Icon name="material-symbols:arrow-back-rounded" class="text-2xl" />
        <span class="ml-2">Voltar</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
  @function getColor($color) {
        $lightness: lightness($color);
        @if($lightness < 60) {
            @return rgb(249, 244, 244);
        } @else {
            @return rgb(28, 27, 27);
        }
    }
    .font-small-screen {
        @media(max-width: 500px) {
            font-size: 0.75rem;
            @media(min-width: 320px) {
                font-size: 0.85rem;
            }
        }
    }
    // classe para limitar o texto e colocar ... no final
    .text-limit {
        max-width: 25ch;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>