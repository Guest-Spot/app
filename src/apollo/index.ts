import type { ApolloClientOptions } from '@apollo/client/core'
import { InMemoryCache } from '@apollo/client/cache/index.js'
import type { BootFileParams } from '@quasar/app-vite'
import { apolloLinkChain } from './links'

export /* async */ function getClientOptions(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  /* {app, router, ...} */ options?: Partial<BootFileParams>
) {
  return <ApolloClientOptions<unknown>>Object.assign(
    // General options.
    <ApolloClientOptions<unknown>>{
      link: apolloLinkChain,

      cache: new InMemoryCache({
        // Optimize cache policies for auth data
        typePolicies: {
          User: {
            fields: {
              id: {
                merge: false,
              },
            },
          },
        },
      }),

      // Default options for better error handling
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
          notifyOnNetworkStatusChange: true,
        },
        query: {
          errorPolicy: 'all',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
    },

    // Specific Quasar mode options.
    process.env.MODE === 'spa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'ssr'
      ? {
          //
        }
      : {},
    process.env.MODE === 'pwa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'bex'
      ? {
          //
        }
      : {},
    process.env.MODE === 'cordova'
      ? {
          //
        }
      : {},
    process.env.MODE === 'capacitor'
      ? {
          //
        }
      : {},
    process.env.MODE === 'electron'
      ? {
          //
        }
      : {},

    // dev/prod options.
    process.env.DEV
      ? {
          //
        }
      : {},
    process.env.PROD
      ? {
          //
        }
      : {},

    // For ssr mode, when on server.
    process.env.MODE === 'ssr' && process.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === 'ssr' && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {}
  )
}
