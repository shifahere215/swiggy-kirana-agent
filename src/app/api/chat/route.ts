import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
          let mockText = "I'm your Kirana Agent. I can help you manage your household restocking.";
          
          if (lastMsg.includes('house party') || lastMsg.includes('sprite')) {
            mockText = "This looks like a bigger order than usual — having people over? Feels like a House Party to me. Want me to save this basket so next time is one tap?";
          } else if (lastMsg.includes('himachal') || lastMsg.includes('away')) {
            mockText = "You've been ordering from a different city for a week. Should I pause your personal restocks while you're away?";
          } else if (lastMsg.includes('arjun') || lastMsg.includes('pune')) {
            mockText = "This looks like a new delivery location. Is this for someone specific? I can keep a separate track for them.";
          } else if (lastMsg.includes('coffee')) {
            mockText = "Hey Priya — your coffee powder is due in about 5 days based on how quickly you usually go through it. Want me to add it to your cart?";
          }

          const words = mockText.split(' ');
          for (const word of words) {
            controller.enqueue(encoder.encode(`0:"${word} "\n`));
            await new Promise((r) => setTimeout(r, 40));
          }
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'x-vercel-ai-data-stream': 'v1'
        }
      });
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'), 
      messages,
      system: `You are Kirana, a proactive, personalised household intelligence agent built on top of Swiggy Instamart. 
Your goal is to act as a contextual household memory layer. You don't just restock; you understand who the user shops for.

Core Capabilities & Persona:
1. Household Graph: You track separate profiles for different delivery addresses (e.g., Home, Mum, Arjun). If you see a new address, ask if it's for a specific person.
2. Empathy & Health: If you notice unusual frequency in health/personal care items, check in gently.
3. Event Anomalies: If you see a bulk order (e.g., chips, Sprite, paper cups), ask if it's a "House Party" or event, and offer to save the basket.
4. Geo-Displacement: If the user orders from a different city, ask if you should pause their home restocking nudges.
5. Privacy: Offer to make sensitive items (medications, personal devices) private.

Keep responses concise, warm, and natural. Do not be overly robotic. Use the provided tools to interact with the Instamart system.`,
      tools: {
        get_orders: {
          description: 'Reads recent order history to infer patterns and establish baselines.',
          parameters: z.object({
            profileName: z.string().describe('The name of the profile (e.g., Home, Mum)')
          }),
          execute: async ({ profileName }) => {
            if (profileName.toLowerCase() === 'home') {
              return { items: ['Coffee powder (every 3 weeks)', 'Milk (daily)', 'Sanitary pads (every 4 weeks)'] };
            }
            return { items: [] };
          }
        },
        create_profile: {
          description: 'Creates a new household graph profile for a new delivery address.',
          parameters: z.object({
            profileName: z.string().describe('The name of the new profile (e.g., Arjun)'),
            address: z.string()
          }),
          execute: async ({ profileName, address }) => {
            return { status: 'success', message: `Profile ${profileName} created for ${address}.` };
          }
        },
        save_event_basket: {
          description: 'Saves a bulk order anomaly as an event basket (e.g., House Party) for one-tap repeat.',
          parameters: z.object({
            eventName: z.string(),
            items: z.array(z.string())
          }),
          execute: async ({ eventName, items }) => {
            return { status: 'success', message: `Event ${eventName} saved with ${items.length} items.` };
          }
        },
        pause_nudges: {
          description: 'Pauses restocking nudges for a specific profile (e.g., during geo-displacement).',
          parameters: z.object({
            profileName: z.string(),
            duration: z.string()
          }),
          execute: async ({ profileName, duration }) => {
            return { status: 'success', message: `Nudges paused for ${profileName} for ${duration}.` };
          }
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
