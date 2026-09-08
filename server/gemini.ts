import { GoogleGenAI } from '@google/genai';
import { db } from './db';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateStudioChatResponse(
  userMessage: string,
  chatHistory: { sender: 'user' | 'bot'; text: string }[] = []
): Promise<string> {
  const services = db.getServices();
  const serviceSummary = services
    .map(s => `• ${s.title} (Starting ₹${s.startingPrice.toLocaleString('en-IN')}) - ${s.description}`)
    .join('\n');

  const systemInstruction = `
You are "Ashish AI", the official intelligent virtual assistant for "Ashish Wedding Film Studio", a premier high-end photography, videography, cinematic wedding film, music recording, and training studio located in Jhumri Telaiya, Jharkhand, India.

STUDIO INFORMATION:
- Studio Name: Ashish Wedding Film Studio
- Founder & Lead Director: Ashish
- Address / Location: Gumo, Kharitand, Jhumri Telaiya, Koderma, Jharkhand, India
- Phone / WhatsApp: +91 87090 17294
- Email: ashishweddingfilm@gmail.com
- Main Specialty: Royal Weddings, Pre-Weddings, 4K 60FPS Cinematic Films, High-End Drone Shoots, Car/Bike Delivery Shoots, Professional Audio Recording, Music Remixing, Photo Albums (Karizma/Canvera Velvet), and Hands-on Certification Training Academy.
- Primary Services & Starting Pricing:
${serviceSummary}

PACKAGES & SPECIAL OFFERS:
1. "Royal Wedding Package" (₹65,000): 2 Candid Photographers + 2 Cinematic Videographers + 4K Drone + Full Wedding Movie + 5 Reels + 40-Sheet Velvet Album.
2. "Classic Wedding Package" (₹45,000): 1 Candid + 1 Traditional Photographer + 1 HD Videographer + Traditional Long Film + 30-Sheet Album.
3. "Pre-Wedding Cinematic Reel" (₹18,000): Telaiya Dam / Forest location + 4K Gimbal & Drone + 2-3 min teaser + 25 Retouched Master Portraits.
4. "New Vehicle Purchase Shoot" (₹9,999): Showroom delivery + rolling highway drone shots + viral Instagram reel with custom audio sync.
5. "Academy Courses": Photography, Cinematography, DaVinci Resolve Video Editing, and FL Studio Audio Mixing courses starting at ₹15,000.

YOUR PERSONALITY & TONE:
- Extremely warm, professional, respectful, and enthusiastic (Indian hospitality tone, occasional polite Hindi/English blend like "Namaste", "Ji", "Certainly!").
- Give direct pricing estimates and invite users to book online via the "Book Now" page, submit an enquiry, or visit our studio in Gumo, Jhumri Telaiya.
- Keep answers formatted clearly with bullet points and bold text.
- If the user asks how to book: Explain they can click "Book Now", select their event date and service, pay a nominal advance via online payment (UPI, Cards, NetBanking, Razorpay), and track their booking status live in the User Dashboard.
`;

  const ai = getAIClient();
  if (!ai) {
    // High-quality smart offline fallback response generator
    return getFallbackResponse(userMessage, services);
  }

  try {
    const formattedHistory = chatHistory.slice(-6).map(msg => 
      `${msg.sender === 'user' ? 'Customer' : 'Ashish AI'}: ${msg.text}`
    ).join('\n');

    const prompt = `${formattedHistory}\nCustomer: ${userMessage}\nAshish AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    if (response && response.text) {
      return response.text.trim();
    }
    return getFallbackResponse(userMessage, services);
  } catch (error) {
    console.warn('Gemini chat error, utilizing smart studio assistant fallback:', error);
    return getFallbackResponse(userMessage, services);
  }
}

function getFallbackResponse(message: string, services: any[]): string {
  const query = message.toLowerCase();

  if (query.includes('wedding') || query.includes('shaadi') || query.includes('marriage')) {
    return `Namaste! 🌸 For weddings, **Ashish Wedding Film Studio** provides:
• **Cinematic Wedding Films** (₹45,000+) - 4K drone cinematography, dialogue voiceovers & Bollywood-style color grading.
• **Wedding Photography** (₹25,000+) - Candid & traditional dual-photographer coverage.
• **Wedding Videography** (₹30,000+) - Full ceremony multi-cam coverage.
• **Royal Complete Package** (₹65,000) - Combined photography, 4K film, drone, and luxury velvet Karizma album!

Would you like to check dates or reserve a slot via our **Book Now** page?`;
  }

  if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('package') || query.includes('fee')) {
    return `Here is a quick overview of our popular service rates at **Ashish Wedding Film Studio**:
• **Wedding Photography**: Starting ₹25,000
• **Wedding Videography**: Starting ₹30,000
• **Cinematic Wedding Films (4K + Drone)**: Starting ₹45,000
• **New Vehicle Purchase Shoot**: Starting ₹9,999
• **Birthday & Anniversary Shoots**: Starting ₹12,000 - ₹14,000
• **Music Studio Vocal Recording**: Starting ₹4,000 / slot
• **Training Academy Course**: Starting ₹15,000

You can view complete feature breakdowns on our **Services** page or book directly with custom date selection!`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('studio') || query.includes('telaiya') || query.includes('jharkhand')) {
    return `📍 **Our Studio Location:**
**Ashish Wedding Film Studio**
Gumo, Kharitand, Jhumri Telaiya, Koderma, Jharkhand, India - 825409

📞 **Contact / WhatsApp:** +91 87090 17294
✉️ **Email:** ashishweddingfilm@gmail.com

Feel free to visit us or book a consultation anytime!`;
  }

  if (query.includes('train') || query.includes('course') || query.includes('learn') || query.includes('academy') || query.includes('class')) {
    return `🎓 **Ashish Studio Academy & Training:**
We offer hands-on certification training for:
1. **Wedding Photography & Camera Mastery** (Sony Alpha FX series & lighting)
2. **Cinematography & Gimbal / Drone Piloting**
3. **Professional Video Editing** (DaVinci Resolve & Premiere Pro color grading)
4. **Music Production & Sound Mixing** (FL Studio & Logic Pro)

Batches start monthly with real on-field wedding shoot training! Course fees start from ₹15,000.`;
  }

  if (query.includes('car') || query.includes('bike') || query.includes('vehicle') || query.includes('delivery')) {
    return `🚗 **New Vehicle Purchase Video Shoot (Starting ₹9,999):**
Celebrate your dream car or bike with high-octane automotive cinema!
• Showroom delivery ribbon ceremony & family moments
• 4K 120FPS ultra-slow motion rolling car-to-car shots
• Cinematic drone tracking shots
• Viral Instagram Reel with custom sound design and bass drop!`;
  }

  if (query.includes('music') || query.includes('song') || query.includes('record') || query.includes('remix') || query.includes('mix')) {
    return `🎵 **Music Production & Studio Services:**
• **Vocal & Acoustic Recording** (₹4,000/slot) - Neumann & Shure SM7B mics with Universal Audio Apollo preamps.
• **Sangeet & DJ Remixing** (₹5,000) - Customized dance mashups and tempo-matched wedding choreography tracks.
• **Mastering & Mixing** (₹4,500) - Radio-ready punch and stereo master for Spotify & YouTube.`;
  }

  if (query.includes('book') || query.includes('advance') || query.includes('payment') || query.includes('date')) {
    return `✨ **How Booking Works:**
1. Navigate to **Book Now** or any service page.
2. Select your event type, date, time, and location.
3. Fill in your contact info and upload optional reference photos.
4. Complete your instant online booking deposit via **Razorpay / UPI / Card**.
5. Receive your digital receipt immediately and track your live status in your **User Dashboard**!`;
  }

  return `Namaste! Welcome to **Ashish Wedding Film Studio** (Gumo, Jhumri Telaiya, Jharkhand). I can help you with:
• Wedding, Pre-Wedding & Event Photography/Videography packages
• New Vehicle Purchase Shoots & Cinematic 4K Films
• Photo Album Designing & Music Studio Recording
• Studio Academy Training Courses & Pricing
• Online Bookings, Quotes, and Event Availability

How may I assist your special celebration today?`;
}
