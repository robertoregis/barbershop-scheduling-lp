// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: true,
  app: {
    //pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: 'Barberia do Bronxs',
      //titleTemplate: 'Painel Administrativo - IndicaPix',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '',
        },
      ],
      link: [
        {hid: 'favicon', rel: 'icon', type: 'image/png', href: '/favicon-indicapix.png'},
        {hid: 'mobileicon', rel: 'apple-touch-icon', sizes: '512x512', href: '/mobileicon-indicapix.png'},
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        },
      ],
      script:[
      ]
    },
  },
  css: [
    'virtual:windi-base.css',
    'virtual:windi-components.css',
    'virtual:windi-utilities.css',
    '~/assets/sass/vendor.scss',
    '~/assets/sass/app.scss',
  ],
  windicss: {
    analyze: {
      analysis: {
        interpretUtilities: false,
      },
      server: {
        port: 4000,
        open: false,
      },
    },
    scan: true,
  },
  devServer: {
    port: 4400,
  },
  experimental: {
    payloadExtraction: false
  },
  devtools: { enabled: false },
  build: {
    transpile: ['vuetify', 'vue-toastification'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    'nuxt-windicss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-icon',
    //...
  ],
  vite: {
    vue: {
    },
  },
  runtimeConfig: {
    public: {
      API_KEY_FIREBASE: process.env.NUXT_API_KEY_FIREBASE,
      AUTH_DOMAIN_FIREBASE: process.env.NUXT_AUTH_DOMAIN_FIREBASE,
      PROJECT_ID_FIREBASE: process.env.NUXT_PROJECT_ID_FIREBASE,
      STORAGE_BUCKET_FIREBASE: process.env.NUXT_STORAGE_BUCKET_FIREBASE,
      MESSAGING_SENDER_ID_FIREBASE: process.env.NUXT_MESSAGING_SENDER_ID_FIREBASE,
      APP_ID_FIREBASE: process.env.NUXT_APP_ID_FIREBASE,
      MEASUREMENT_ID_FIREBASE: process.env.NUXT_MEASUREMENT_ID_FIREBASE,
      SECRET_KEY_AUTH: process.env.NUXT_SECRET_KEY_AUTH,
      SALT: process.env.NUXT_SALT,
    }
  },
  experimental: {
    reactivityTransform: false,
  },
  components: true,
  vueuse: {
    ssrHandlers: true,
  },
})
