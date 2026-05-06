import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    databaseDriverOptions: {
      ssl: false,
      sslmod: "disable",
    },
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    redisUrl: process.env.REDIS_URL,
  },
  admin: {
  disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  vite: (config) => {
    if (process.env.NODE_ENV === "development") {
      return {
        ...config,
        server: {
          host: "0.0.0.0",
          port: 5173,
          // This allows you to access the dev server from any host 
          // (like your local IP or localhost) without being blocked.
          allowedHosts: true, 
          hmr: {
            port: 5173,
            clientPort: 5173,
          },
        },
      }
    }
    return config;
  },
},
  modules: [
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            // Optional, makes this the default caching provider
            is_default: true,
            options: {
              redisUrl: process.env.CACHE_REDIS_URL,
              // more options...
            },
          },
          // other caching providers...
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.EVENTS_REDIS_URL,
        // suggested additional options for production use
        jobOptions: {
          removeOnComplete: {
            // keep jobs for 1 hour or up to 1000 jobs
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            // keep jobs for 1 hour or up to 1000 jobs
            age: 3600,
            count: 1000,
          },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.WE_REDIS_URL,
          // ...other Redis options
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            // set this if you want this provider to be used by default
            // and you have other Locking Module Providers registered.
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
  ]
})
