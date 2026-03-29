export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-03-27',

  future: {
    compatibilityVersion: 4,
  },

  modules: ['@pinia/nuxt'],

  app: {
    head: {
      title: 'Al Romaizan Analytics',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables" as *;\n',
        },
      },
    },
  },
})
