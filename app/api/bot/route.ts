export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import { Bot, webhookCallback } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

const bot = new Bot(token)

// Echo back any text message
bot.on('message:text', async (ctx) => {
  await ctx.reply(`You said: ${ctx.message.text}`)
})

// Handle /start command
bot.command('start', async (ctx) => {
  await ctx.reply('Hello! I\'m your GeoTrack bot. Send me any message and I\'ll echo it back!')
})

// Handle /hello command
bot.command('hello', async (ctx) => {
  await ctx.reply('Hello there! 👋')
})

// Handle location messages
bot.on('message:location', async (ctx) => {
  const location = ctx.message.location
  await ctx.reply(`📍 Location received! Lat: ${location.latitude}, Long: ${location.longitude}`)
})

export const POST = webhookCallback(bot, 'std/http')

// Function to send messages programmatically (can be called from other parts of your app)
export async function sendMessage(chatId: string, text: string) {
  try {
    await bot.api.sendMessage(chatId, text)
    return { success: true }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error }
  }
}