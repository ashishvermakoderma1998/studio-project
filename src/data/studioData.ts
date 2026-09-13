import { Service, GalleryItem, Review, KarizmaAlbumItem } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-wedding-photo',
    slug: 'wedding-photography',
    title: 'Wedding Photography',
    category: 'Wedding',
    tagline: 'Timeless moments captured with artistic precision and emotional depth.',
    description: 'Complete high-resolution traditional and candid wedding photography covering rituals, portraits, emotional family moments, and grand celebrations.',
    features: [
      'Candid & Traditional Photographers (Dual Crew)',
      'Sony Full-Frame Alpha 7 IV / 7R V Cameras & G-Master Lenses',
      'Unlimited High-Res RAW processed photos',
      'Custom color grading & skin retouching',
      'Online digital gallery with private access code'
    ],
    deliverables: [
      '500+ Retouched High-Definition Photos',
      'Premium Hardcover Glossy Photo Album (30 Sheets)',
      'Personalized Pendrive & Cloud download link',
      'Teaser photo highlights within 48 hours'
    ],
    startingPrice: 25000,
    duration: 'Full Day Event Coverage',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    popular: true,
    equipment: ['Sony A7R V', 'Sony 24-70mm f/2.8 GM II', 'Godox AD400 Pro Strobe', 'Profoto Modifiers'],
    faqs: [
      { q: 'How many photographers attend the wedding?', a: 'Depending on the package, our team sends 2 to 4 dedicated photographers (candid and traditional).' },
      { q: 'When do we receive the edited photos?', a: 'Teaser photos are shared within 48 hours. The complete edited gallery is delivered within 15-20 days.' }
    ]
  },
  {
    id: 'srv-wedding-video',
    slug: 'wedding-videography',
    title: 'Wedding Videography',
    category: 'Wedding',
    tagline: 'Cinematic storytelling celebrating your cultural rituals and vibrant memories.',
    description: 'Comprehensive 4K ultra-high definition video shooting with multi-camera setup, gimbal stabilization, wireless audio feeds, and full documentary ceremony coverage.',
    features: [
      'Multi-Camera 4K 60FPS Video Setup',
      'Ronin Gimbal & Crane shots for grand entries',
      'Dedicated Wireless Lav Audio capture for vows and rituals',
      'Full ceremony live-switching available',
      'Drone aerial cinematography included in premium tier'
    ],
    deliverables: [
      'Full Ceremony Long Film (60-90 Mins)',
      'Customized cinematic menus & chapter markers',
      '4K Master pendrive in luxury wood box',
      'Social media reels & YouTube formatted export'
    ],
    startingPrice: 30000,
    duration: 'Full Event Coverage',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    popular: true,
    equipment: ['Sony FX3 Cinema Line', 'DJI RS 3 Pro Gimbal', 'Sennheiser AVX Mics', 'DJI Mavic 3 Cine'],
    faqs: [
      { q: 'Do you shoot in 4K resolution?', a: 'Yes, all our cinematic and traditional videos are recorded natively in 4K 10-bit color.' }
    ]
  },
  {
    id: 'srv-cinematic-film',
    slug: 'cinematic-wedding-films',
    title: 'Cinematic Wedding Films',
    category: 'Cinematic Films',
    tagline: 'Movie-grade visual poetry starring you and your partner.',
    description: 'An emotionally captivating theatrical wedding film crafted with director-style narrative pacing, dramatic color grading, licensed acoustic soundtrack, and 4K drone cinematography.',
    features: [
      'Director-led cinematic narrative structure',
      '4K HDR Hollywood color grade (Arri/Sony Log profiles)',
      'Aerial 4K Drone footage of venue and couple shots',
      'Couple audio interviews and voiceover sync',
      'Same-day edit teaser option for reception premiere'
    ],
    deliverables: [
      '3-5 Minute Cinematic Wedding Trailer (4K)',
      '15-20 Minute Master Theatrical Wedding Film',
      '5 Instagram Reels optimized for mobile viewing',
      'Exclusive 4K Cloud link for lifetime streaming'
    ],
    startingPrice: 45000,
    duration: 'Multi-Day Wedding Celebration',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    popular: true,
    equipment: ['Sony FX6 Cinema Camera', 'Cooke Anamorphic / Sony GM Glass', 'DJI Inspire 3 Drone', 'Hollywood Grade LUTs'],
    faqs: [
      { q: 'What is the difference between videography and cinematic film?', a: 'Videography documents the events chronologically, while a cinematic film is a crafted movie with curated music, story pacing, emotional soundbites, and dramatic cinematic lighting.' }
    ]
  },
  {
    id: 'srv-birthday-shoot',
    slug: 'birthday-shoot',
    title: 'Birthday Photoshoot & Video Shoot',
    category: 'Events',
    tagline: 'Vibrant milestone celebrations frozen in joyful frames.',
    description: 'Professional photo and video coverage for 1st birthdays, sweet sixteens, 50th jubilees, cake smashing, kids parties, and theme celebrations.',
    features: [
      'Studio or on-location setup',
      'Cake smash & candid party moments',
      'Family group portraits & dynamic child candid shots',
      'Fun short video reel with trending music'
    ],
    deliverables: [
      '100+ High-Resolution Edited Images',
      '1 Minute Cinematic Birthday Highlights Video (4K)',
      'Digital album flipbook for family sharing'
    ],
    startingPrice: 12000,
    duration: '3 to 5 Hours',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    popular: false,
    equipment: ['Sony A7 IV', 'Portable Godox Battery Strobes', 'Softboxes', 'Gimbal']
  },
  {
    id: 'srv-anniversary-shoot',
    slug: 'anniversary-shoot',
    title: 'Anniversary Photoshoot & Video Shoot',
    category: 'Events',
    tagline: 'Revisiting eternal love with romantic outdoor and studio portraits.',
    description: 'Romantic couple portrait sessions and anniversary party coverage. Celebrate 1st, 10th, 25th Silver, or 50th Golden anniversaries with elegance.',
    features: [
      'Scenic outdoor location scouting or studio set',
      'Vow renewal or couple dance highlights',
      'Vintage & romantic warm cinematic grading',
      'Special nostalgic audio interview recording'
    ],
    deliverables: [
      '75+ Retouched Romantic Couple Portraits',
      '2-3 Minute Anniversary Nostalgia Film',
      'Framed 16x24 Canvas Print'
    ],
    startingPrice: 14000,
    duration: '4 Hours',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-vehicle-shoot',
    slug: 'vehicle-purchase-shoot',
    title: 'New Vehicle Purchase Video Shoot',
    category: 'Cinematic Films',
    tagline: 'Showcase your dream car or bike with high-octane automotive cinematography.',
    description: 'High-energy commercial-style automotive video delivery shoot with roll-out smoke, rolling car-to-car shots, close-up details, drone tracking, and intense sound design.',
    features: [
      'Showroom delivery celebration coverage',
      'Dynamic rolling shots on highway / scenic roads',
      '4K 120FPS ultra-slow motion wheel and headlight details',
      'Custom rev audio enhancement and EDM/Trap background score'
    ],
    deliverables: [
      '1-Minute Viral Instagram Car Reel / YouTube Shorts (9:16 & 16:9)',
      '15 High-End Color Graded Automotive Wallpapers',
      'Raw footage archive upon request'
    ],
    startingPrice: 9999,
    duration: '3 Hours',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    popular: true
  },
  {
    id: 'srv-pro-video-shooting',
    slug: 'professional-video-shooting',
    title: 'Professional Video Shooting',
    category: 'Videography',
    tagline: 'Commercial-grade video production for businesses, commercials, and events.',
    description: 'End-to-end studio & field camera operation for corporate documentaries, interviews, fashion model reels, musical performances, and product commercials.',
    features: [
      'Studio 3-point lighting setup with RGB accents',
      'Teleprompter service available for scripts',
      'Broadcast-quality shotgun & wireless lav microphones',
      'Green screen / chroma key studio shooting available'
    ],
    deliverables: [
      '4K Pro-Res or MP4 Master Exports',
      'Clean multi-track audio files',
      'B-roll footage archive'
    ],
    startingPrice: 18000,
    duration: 'Half or Full Day Shifts',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-video-editing',
    slug: 'video-editing',
    title: 'Video Editing',
    category: 'Editing & Design',
    tagline: 'Fast, rhythm-synced cinematic editing in DaVinci Resolve & Premiere Pro.',
    description: 'High-end post-production video editing for weddings, YouTube creators, corporate ads, documentaries, and music videos. Includes color grading, VFX, sound mixing, and transitions.',
    features: [
      'Advanced DaVinci Resolve Studio color grading',
      'Dynamic speed ramps, whip pans, and glitch effects',
      'Audio noise reduction & dialogue mastering',
      'Motion graphics, title intros, and subtitle styling'
    ],
    deliverables: [
      'Final 4K Master Video with revision support (up to 3 rounds)',
      'Vertical Reel & Landscape Master formats'
    ],
    startingPrice: 6000,
    duration: '3-5 Business Days',
    image: 'https://images.unsplash.com/photo-1574717024453-354056aef97f?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-photo-editing',
    slug: 'photo-editing',
    title: 'Photo Editing',
    category: 'Editing & Design',
    tagline: 'Flawless frequency separation, magazine skin retouching, and color grading.',
    description: 'High-end Photoshop & Lightroom retouching service for weddings, modeling portfolios, product catalogs, and vintage photo restoration.',
    features: [
      'Natural frequency separation skin retouching',
      'Background cleanup & unwanted object removal',
      'Mood color grading (Warm Moody, Pastel, Rich Golden, Classic B&W)',
      'Body posture refinement & eye/teeth enhancement'
    ],
    deliverables: [
      'Full resolution print-ready JPEG and TIFF files',
      'Social media optimized versions'
    ],
    startingPrice: 3500,
    duration: '24-48 Hours Turnaround',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-photo-album',
    slug: 'photo-album-editing',
    title: 'Photo Album Designing & Editing',
    category: 'Editing & Design',
    tagline: 'Luxurious Karizma, Canvera, and Velvet finish coffee table wedding albums.',
    description: 'Bespoke modern photo album layout design with aesthetic page layouts, traditional motifs, gold foil stamping, and waterproof non-tearable velvet paper sheets.',
    features: [
      'Custom magazine-style layout creation',
      'Variety of covers: Leatherite, Acrylic Glass, Wood Grain, Metal Cameo',
      'Layflat 180-degree seamless binding',
      'Waterproof, UV-resistant non-tearable sheets'
    ],
    deliverables: [
      'Physical 12x36 or 12x30 Luxury Wedding Album (30 to 50 sheets)',
      'Matching luxury briefcase / presentation box',
      'High-res PDF digital proof for review before printing'
    ],
    startingPrice: 8500,
    duration: '7-10 Days Delivery',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    popular: true
  },
  {
    id: 'srv-music-recording',
    slug: 'music-recording',
    title: 'Music Recording',
    category: 'Music Production',
    tagline: 'Acoustically treated sound studio with studio condenser mics and high-end preamps.',
    description: 'Record professional vocals, instruments, wedding tribute songs, voiceovers, podcasts, and acoustic tracks in our state-of-the-art studio in Jhumri Telaiya.',
    features: [
      'Neumann & Shure SM7B Condenser Microphones',
      'Universal Audio Apollo Twin X Duo Interface with Neve preamps',
      'Vocal tuning, pitch correction (Auto-Tune / Melodyne)',
      'Live vocal coaching by sound engineer during recording'
    ],
    deliverables: [
      'Multi-track WAV stems 24-bit 48kHz',
      'Rough stereo reference mix for review'
    ],
    startingPrice: 4000,
    duration: 'Per 2-Hour Slot',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-music-remixing',
    slug: 'music-remixing',
    title: 'Music Remixing',
    category: 'Music Production',
    tagline: 'Club-ready Bollywood, Punjabi, and EDM dance remixes for wedding sangeet.',
    description: 'Transform traditional tracks or your favorite Bollywood wedding songs into high-tempo DJ remixes, Mashups, and Sangeet dance medleys customized to your performance steps.',
    features: [
      'Custom BPM tempo matching & key alignment',
      'Sangeet dance choreography track stitching & sound effects',
      'Heavy club sub-bass, punchy 808s, and percussion groove',
      'Voice tags & celebratory sound intros'
    ],
    deliverables: [
      'High-Quality MP3 (320kbps) and WAV 24-bit masters',
      'Track timeline cue notes for dancers'
    ],
    startingPrice: 5000,
    duration: '2-4 Days',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    popular: true
  },
  {
    id: 'srv-music-mixing',
    slug: 'music-mixing',
    title: 'Music Mixing & Mastering',
    category: 'Music Production',
    tagline: 'Crystal clear stereo width, punchy dynamics, and broadcast loudness.',
    description: 'Professional multi-track mixing and mastering for singles, film background scores, wedding songs, and albums ready for Spotify, Apple Music, and YouTube.',
    features: [
      'FabFilter, Waves, iZotope Ozone 11 mastering chain',
      'Dynamic EQ, multi-band compression, and analog tape warmth',
      'Stereo image widening & sub-frequency mono control',
      'True Peak -14 LUFS Spotify/Apple Music standard compliance'
    ],
    deliverables: [
      'Stereo Master WAV (24-bit 44.1/48kHz)',
      'Instrumental & Acapella Master versions'
    ],
    startingPrice: 4500,
    duration: '3 Business Days',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    popular: false
  },
  {
    id: 'srv-learning-training',
    slug: 'learning-training',
    title: 'Learning & Training Academy',
    category: 'Training & Courses',
    tagline: 'Practical hands-on certification in Photography, Cinematography, Video Editing & Music Production.',
    description: 'Learn industry-level skills directly from Ashish and senior studio professionals. Intensive 1-month to 3-month courses with real studio equipment, live shoot mentorship, and placement guidance.',
    features: [
      'Module 1: Camera Mastery, Lighting & Composition (Sony/Canon)',
      'Module 2: Wedding Cinematography, Gimbal & Drone Piloting',
      'Module 3: Premiere Pro & DaVinci Resolve Color Grading Mastery',
      'Module 4: FL Studio / Logic Pro Audio Recording & Mixing',
      'Live wedding project internship & portfolio building'
    ],
    deliverables: [
      'Recognized Ashish Studio Certification of Completion',
      '1-on-1 Portfolio review and showreel creation',
      'Lifetime community access & job referral network'
    ],
    startingPrice: 15000,
    duration: '4 Weeks / 8 Weeks Batch',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    popular: true,
    faqs: [
      { q: 'Do I need my own camera to join?', a: 'No, students get hands-on access to all studio cameras, lights, lenses, and editing workstations during classes.' },
      { q: 'Where are the classes held?', a: 'Classes are conducted offline at Ashish Wedding Film Studio, Gumo, Kharitand, Jhumri Telaiya, Jharkhand.' }
    ]
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Royal Marwari Wedding at Royal Palace',
    category: 'Weddings',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    eventType: 'Traditional Wedding',
    client: 'Rahul & Priya',
    description: 'An enchanting vermilion and gold ceremony under a floral mandap with cinematic fireworks and warm candids.',
    featured: true
  },
  {
    id: 'gal-2',
    title: 'The Eternal Vows - 4K Cinematic Wedding Film',
    category: 'Cinematic Videos',
    type: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    eventType: 'Cinematic Film',
    client: 'Amit & Shweta',
    description: 'A director-style 4K film featuring drone shots across Telaiya dam and sunset vows.',
    featured: true
  },
  {
    id: 'gal-3',
    title: 'Sunset Whispers - Pre-Wedding at Telaiya Dam',
    category: 'Pre-Wedding',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    eventType: 'Pre-Wedding Session',
    client: 'Vikram & Neha',
    description: 'Golden hour silhouette reflections on the water with flare lenses and smoke bombs.',
    featured: true
  },
  {
    id: 'gal-4',
    title: 'Mahindra Scorpio-N Monster Delivery Shoot',
    category: 'Vehicle Shoots',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    eventType: 'Vehicle Purchase Shoot',
    client: 'Karan Sharma',
    description: 'Smoky delivery reveal followed by scenic high-speed rolling video shots.',
    featured: true
  },
  {
    id: 'gal-5',
    title: 'Ayaan 1st Birthday Carnival',
    category: 'Birthdays',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    eventType: 'Birthday Celebration',
    client: 'Verma Family',
    description: 'Jungle theme balloons, cake smashing candids, and cheerful family group shots.',
    featured: false
  },
  {
    id: 'gal-6',
    title: 'Silver Jubilee 25th Anniversary Vows',
    category: 'Anniversaries',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80',
    eventType: 'Anniversary Shoot',
    client: 'Mr. & Mrs. Gupta',
    description: 'A heartfelt romantic session in bespoke classic attire celebrating 25 years together.',
    featured: false
  },
  {
    id: 'gal-7',
    title: 'Studio Vocal Session & Track Production',
    category: 'Music Studio',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    eventType: 'Music Recording',
    client: 'Rohan (Singer)',
    description: 'Recording live devotional and romantic tracks in our acoustically treated Jhumri Telaiya sound suite.',
    featured: true
  },
  {
    id: 'gal-8',
    title: 'Bride Bridal Haldi & Sangeet Moments',
    category: 'Photography',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    eventType: 'Haldi Ceremony',
    client: 'Pooja Singh',
    description: 'Vibrant yellow marigold showers, radiant joyful tears, and detailed bridal jewelry close-ups.',
    featured: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userId: 'usr-demo-1',
    userName: 'Rajesh & Pooja Keshri',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Ashish Wedding Film Studio made our wedding unforgettable! The cinematic film felt like a Bollywood movie. Ashish ji and team were punctual, respectful, and so creative with every angle in Jhumri Telaiya.',
    eventType: 'Grand Wedding & Reception',
    approved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: 'rev-2',
    userId: 'usr-demo-2',
    userName: 'Vivek Barnwal',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'I booked the New Vehicle Purchase Shoot for my new Thar. The drone tracking shots and the reel edit with customized music blew everyone away on Instagram! Worth every single rupee.',
    eventType: 'Vehicle Purchase Shoot',
    approved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
  },
  {
    id: 'rev-3',
    userId: 'usr-demo-3',
    userName: 'Sunita & Deepak Agarwal',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'The Karizma velvet wedding photo album delivered by Ashish Studio is of royal quality. The page designs, colors, and finish exceeded our expectations. Best studio in Jharkhand.',
    eventType: 'Photo Album & Video',
    approved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'rev-4',
    userId: 'usr-demo-4',
    userName: 'Manish Kumar (Student)',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Completed the 2-Month Cinematography & Video Editing course at Ashish Studio Academy. Ashish sir taught us live camera handling on FX3 and Premiere Pro color grading. Now I am working on live projects!',
    eventType: 'Learning / Training Course',
    approved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

export const INITIAL_KARIZMA_ALBUMS: KarizmaAlbumItem[] = [
  {
    id: 'krz-1',
    title: 'Royal Marwari Vivah - Velvet Layflat Edition',
    coupleName: 'Rahul & Priya',
    albumType: 'Royal Velvet',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    sheetsCount: 40,
    eventDate: '2026-02-18',
    location: 'Royal Palace Banquet, Jhumri Telaiya',
    description: '12x36 Seamless panoramic layflat wedding album in waterproof Non-Tearable Velvet sheet with embossed golden couple monogram and matching padded briefcase.',
    spreads: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=85'
    ],
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  {
    id: 'krz-2',
    title: 'Bhojpuri Heritage Wedding - Canvera HD Silk',
    coupleName: 'Amit & Shweta',
    albumType: 'Canvera HD',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
    sheetsCount: 35,
    eventDate: '2026-01-24',
    location: 'Utsav Marriage Hall, Koderma',
    description: 'Ultra-High-Definition Canvera Silk photobook with 180-degree flat opening, anti-scratch coating, vibrant Sindoor Daan highlights, and Baraat double spreads.',
    spreads: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=85'
    ],
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
  },
  {
    id: 'krz-3',
    title: 'Sunset Whispers Pre-Wedding - 3D Acrylic Glass Cover',
    coupleName: 'Vikram & Neha',
    albumType: 'Acrylic Glass',
    coverImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
    sheetsCount: 25,
    eventDate: '2026-03-02',
    location: 'Tilaiya Dam & Reservoir, Jharkhand',
    description: 'Luxury front 6mm beveled Acrylic Glass cover with sparkling metallic photographic paper inside. Preserves sunset hues and water reflections.',
    spreads: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=85'
    ],
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'krz-4',
    title: 'Grand Rajwada Celebration - Metallic Sheen Book',
    coupleName: 'Ankit & Sneha',
    albumType: 'Metallic Sheen',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    sheetsCount: 45,
    eventDate: '2025-12-14',
    location: 'Surya Mandir Road, Jhumri Telaiya',
    description: 'Foil-pressed gold edges, high-contrast metallic luster paper, 45 panoramic sheets depicting Haldi, Mehendi, Sangeet, and Vidai rituals.',
    spreads: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  },
  {
    id: 'krz-5',
    title: 'Timeless Romance - Handcrafted Leatherite Cameo',
    coupleName: 'Rohan & Megha',
    albumType: 'Leatherite Cameo',
    coverImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=85',
    sheetsCount: 30,
    eventDate: '2026-01-10',
    location: 'Hazaribagh / Koderma Highway Resort',
    description: 'Rich vintage brown leatherite hard-binding with a center cameo photo window. Archival acid-free matte finish paper that lasts for generations.',
    spreads: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=85'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString()
  }
];

export const STUDIO_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/ashishweddingfilm',
  instagram: 'https://www.instagram.com/ashishweddingfilm',
  youtube: 'https://www.youtube.com/@ashishweddingfilm',
  whatsapp: 'https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20want%20to%20inquire%20about%20your%20photography%20and%20film%20packages.'
};
