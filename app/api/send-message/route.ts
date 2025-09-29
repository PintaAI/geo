import { NextRequest, NextResponse } from 'next/server'
import { Bot } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

const bot = new Bot(token)

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json()

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      )
    }

    await bot.api.sendMessage(chatId, message)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error },
      { status: 500 }
    )
  }
}