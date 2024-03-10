// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { pt } from 'vuetify/locale'

import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    locale: {
      locale: 'pt',
      fallback: 'pt',
      messages: { pt },
    }
  })
  app.vueApp.use(vuetify)
})
