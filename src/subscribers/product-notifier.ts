import {
    type SubscriberConfig,
    type SubscriberArgs
} from "@medusajs/framework"

export default async function productCreateHandler({
    event,
    container
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve("logger")

    // This is the "Aha!" moment log
    logger.info(`🚀 WORKER DETECTED EVENT: ${event.name}`)
    logger.info(`📦 New Product ID received from Server: ${event.data.id}`)
}

export const config: SubscriberConfig = {
    event: "product.created",
}