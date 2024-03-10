
import { defineConfig } from 'windicss/helpers';
import type { Plugin } from 'windicss/types/interfaces';

// colors
import colors from 'windicss/colors'
// themes
import defaultTheme from 'windicss/defaultTheme'
// plugins
import TypographyPlugin from 'windicss/plugin/typography'
import AspectRatioPlugin from 'windicss/plugin/aspect-ratio'
import FiltersPlugin from 'windicss/plugin/filters'

let font = process.env.NUXT_FONT_FAMILY ? process.env.NUXT_FONT_FAMILY : "'Montserrat', sans-serif"

const MyTheme = {
  colors: {
    main: {
      DEFAULT: '#7BA05B',
    },
    mainFull: {
      DEFAULT: '#456F21',
    }
  },
}

export default defineConfig({
  darkMode: 'class',
  attributify: false,
  extract: {
    include: [
      './components/**/*.{vue,js}',
      './composables/**/*.{js,ts}',
      './content/**/*.md',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './utils/**/*.{js,ts}',
      './app.vue',
    ],
  },
  theme: {
    screens: {
      //'cel': {'max': '400px'}, // esta parte faz o contrário, trabalha do maior para o menor 
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1199px',
      '2xl': '1350px',
      '3xl': '1600px'
    },
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      fontFamily: {
        sans: [font],
      },
    },
  },
  shortcuts: {
    'light-img': 'block dark:hidden',
    'dark-img': 'hidden dark:block',
  },
  plugins: [
    // filters plugin require for navbar blur
    FiltersPlugin as Plugin,
    TypographyPlugin as Plugin,
    AspectRatioPlugin as Plugin,
  ] as Plugin[],

})
