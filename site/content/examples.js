/* ==========================================================================
   SHOWCASE EXAMPLES — edit this file to change the homepage grid.
   --------------------------------------------------------------------------
   - Order matters: the first 6 are the strongest. Most people stop there.
   - `cat` must be one of: work, personal, school, social, creative
   - `format` decides how the output is drawn (see js/formats.js):
       email · texts · page · linkedin · thread · instagram · profile · listing
   - `seconds` is how long it took to write. Word count is counted for you.
   - `note` (optional) is a red-pen margin note.
   - `chatgpt` is what ChatGPT wrote for the same prompt.
       ⚠ PLACEHOLDERS: before launch, paste ChatGPT's real answers here.
   - Admins can also edit these from /admin → Content (saved as an override).
   ========================================================================== */
window.ABG_EXAMPLES = [
  /* ------------------------------------------------ top 6 ------------ */
  {
    id: 'landlord-heater', cat: 'personal', format: 'texts', seconds: 3.1,
    note: 'firm, not rude. nailed it',
    prompt: 'my landlord ignored me twice, heater broke 2 weeks ago, make it firm but not rude',
    output: {
      contact: 'Mark (landlord)',
      messages: [
        { me: true, context: true, text: 'Hi, the heater in 4B stopped working last night. Can someone take a look?' },
        { me: true, context: true, text: 'Following up on the heater, still out.' },
        { me: true, text: "Hi Mark, it's Dana in 4B. The heater has been out for two weeks now and I've texted twice without hearing back. It's getting down to 58 inside at night." },
        { me: true, text: "I need a repair scheduled by Friday. If that isn't possible, please tell me what the plan is so I can figure out next steps." },
        { me: true, text: "I'm home after 5 any day this week, or maintenance can use the lockbox." },
      ],
    },
    chatgpt: "Dear [Landlord's Name],\n\nI hope this message finds you well. I am writing to follow up on my previous messages regarding the broken heater in my unit. It has now been two weeks, and the issue remains unresolved. I kindly request that you address this matter at your earliest convenience, as it is significantly impacting my living conditions.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\n[Your Name]",
  },
  {
    id: 'raise-email', cat: 'work', format: 'email', seconds: 4.4,
    note: 'zero em dashes',
    prompt: "need to ask my boss for a raise, been here 2 yrs, took over sarah's accounts when she left, dont want to sound greedy",
    output: {
      from: 'Luis Moreno', to: 'Priya Shah', subject: 'Time to talk about my salary?',
      body: "Hi Priya,\n\nCould we find 30 minutes next week to talk about my pay?\n\nSince Sarah left in March, I've been running her four accounts on top of my own. All four renewed, and Halvorsen grew their contract by about a third. I've liked the extra responsibility and I want to keep growing into it. But my pay hasn't changed since I was hired two years ago, and my job has.\n\nI've looked at what account managers with this load make around here, and I'd like to talk about getting closer to that range. I'll bring numbers so it's a real conversation, not a vague ask.\n\nDoes Tuesday or Wednesday afternoon work?\n\nThanks,\nLuis",
    },
    chatgpt: "Subject: Request for Salary Review\n\nDear [Manager's Name],\n\nI hope this email finds you well. I wanted to take a moment to discuss my compensation. Over the past two years, I have consistently demonstrated my commitment to the team and have taken on additional responsibilities, including managing accounts previously handled by a colleague.\n\nI believe my contributions warrant a review of my current salary. I would greatly appreciate the opportunity to discuss this further at your convenience.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]",
  },
  {
    id: 'college-essay', cat: 'school', format: 'page', seconds: 9.8,
    note: 'that last line. come on.',
    prompt: 'college essay about quitting soccer after 10 years. my parents were upset. i started working at a bike shop instead. 650 words max',
    output: {
      title: 'Quitting',
      body: "For ten years, my Saturdays started at 6:40 a.m. My mom would knock twice, my cleats would already be by the door, and by 7:15 I'd be in the back of our Honda eating a banana I didn't want.\n\nI was good at soccer. Not great, but good enough that people assumed it was the plan. My dad kept a folder of my club schedules going back to U8. When I told my parents I wanted to quit the summer before junior year, my mom asked if something had happened. Nothing had. That was the problem. I'd stopped feeling anything on the field except relief when the whistle blew.\n\nWhat I didn't tell them at first was where I'd been going after practice. There's a bike shop on Grand Avenue run by a man named Hector, who has been fixing bikes since before I was born. I started stopping in because my chain kept slipping. I kept stopping in because I liked watching him work. He never rushed. He'd spin a wheel, listen, and know what was wrong before he touched it.\n\nOne day he handed me a truing stand and a wheel that wobbled like a dinner plate. It took me two hours. It was the best two hours I'd had in months.\n\nI've worked there for a year now. I've rebuilt maybe two hundred bikes: commuter bikes held together with zip ties, a $4,000 road bike whose owner teared up when the shifting finally worked, a pink tricycle a little girl brought in by herself and paid for in quarters.\n\nMy parents came around slowly. My dad stopped by the shop last spring and watched me replace a bottom bracket. He didn't say much. On the way out he asked Hector if I was any good. Hector said, \"He listens.\" My dad nodded like that answered something.\n\nQuitting soccer wasn't giving up. It was the first decision I ever made that didn't come with a folder. I want to study mechanical engineering because I've learned I'm happiest with my hands on a problem, taking it apart until I understand it. Ten years of soccer taught me how to show up. One year at the shop taught me what I want to show up for.",
    },
    chatgpt: "Title: The Courage to Change Direction\n\nFor as long as I can remember, soccer was an integral part of my identity. For ten years, I dedicated countless hours to honing my skills on the field. However, as I grew older, I began to realize that my true passion lay elsewhere.\n\nMaking the decision to quit soccer was one of the most challenging experiences of my life. My parents were initially disappointed, but I knew I had to follow my heart. Working at a local bike shop, I discovered a newfound love for mechanics and problem-solving. This journey taught me valuable lessons about resilience, self-discovery, and the importance of pursuing one's true passions.",
  },
  {
    id: 'breakup-text', cat: 'personal', format: 'texts', seconds: 2.2,
    prompt: "breakup text. we've been on like 5 dates, hes really nice but im not feeling it. dont want to ghost",
    output: {
      contact: 'Chris',
      messages: [
        { me: true, text: "Hey Chris, I've had a really good time with you these past few weeks, and I wanted to be honest instead of just going quiet." },
        { me: true, text: "I'm not feeling the kind of connection I'm looking for. That's not about anything you did. You've been kind and fun the whole time." },
        { me: true, text: "I didn't want to string you along. I hope you find someone who's all in, you deserve that." },
      ],
    },
    chatgpt: "Hi [Name], I wanted to reach out and let you know that I've really enjoyed getting to know you over the past few dates. However, after some reflection, I've realized that I don't feel the romantic connection I'm looking for. I truly value the time we've spent together and wish you all the best in your journey. Take care!",
  },
  {
    id: 'linkedin-layoff', cat: 'work', format: 'linkedin', seconds: 5.6,
    note: 'not cringe. somehow',
    prompt: 'linkedin post about getting laid off. dont want it to be sad or cringe. i was a product manager for 4 years at a fintech',
    output: {
      name: 'Renee Park', headline: 'Product Manager · Open to work',
      body: "I got laid off on Tuesday, along with about 40 other people.\n\nI'm not going to pretend it didn't sting. Four years is a long time, and I spent most of it on one product: the app that helps small businesses get paid faster. I watched it go from a spreadsheet and a Figma file to something 60,000 businesses open every week. That doesn't go away because my badge stopped working.\n\nA few things I know now that I didn't know on Monday:\n\nMy team is ridiculous. Three of them texted me job leads before I got home.\nI like the messy early stage more than the polished late one.\nI am bad at unemployment. It's been four days and I've reorganized the garage twice.\n\nSo I'm looking for my next product role, ideally somewhere early, ideally in payments or tools for small businesses. If you're building something like that, or know someone who is, I'd love to talk.\n\nAnd if you were part of Tuesday too, my DMs are open. Happy to look at a resume or just complain together.",
    },
    chatgpt: "🚀 New Beginnings 🚀\n\nAfter 4 incredible years as a Product Manager, I was recently impacted by a reduction in force. While this news was unexpected, I am filled with gratitude for the amazing journey and the talented colleagues I had the privilege to work with.\n\nI'm excited to embark on the next chapter of my career and am open to new opportunities in product management. If you know of any roles, I'd love to connect!\n\n#OpenToWork #ProductManagement #Fintech #NewBeginnings",
  },
  {
    id: 'best-man', cat: 'personal', format: 'page', seconds: 7.3,
    note: 'the pickles callback!!',
    prompt: 'best man speech for my brother danny. hes marrying jess. he used to be a mess, jess made him get his life together. funny but not roast-y, 2 min',
    output: {
      title: 'Best Man Speech',
      body: "Good evening. For those who don't know me, I'm Mike, Danny's older brother, which means I've known him longer than anyone in this room except our mom, and she has agreed not to give a speech. You're welcome.\n\nGrowing up, Danny was a lot. He once tried to microwave a burrito still in the foil because he'd \"seen it work on YouTube.\" He owned four phone chargers and could never find one. When he moved into his first apartment, the only things in the fridge for three months were a jar of pickles and a Brita filter he never filled.\n\nThen he met Jess.\n\nI don't know exactly what happened. I just know that about a year in, I went to his place and there was a spice rack. Alphabetized. There was a plant, and it was alive. He called me on my birthday, on the actual day, without a reminder.\n\nJess, you didn't change who Danny is. He's still the funniest person I know and he still can't find his keys. You just made him want to show up. Watching my little brother become the kind of guy who shows up has been one of the best things I've gotten to see.\n\nSo please raise your glasses. To Danny and Jess. May your fridge always have more than pickles.",
    },
    chatgpt: "Good evening, everyone! For those who don't know me, I'm [Your Name], Danny's brother and best man. It's an honor to stand here today.\n\nDanny has always been a unique individual, and let's just say he wasn't always the most organized person. But then Jess came into his life and everything changed. Jess, you have brought out the best in Danny, and we are all so grateful.\n\nPlease join me in raising a glass to the happy couple. To Danny and Jess! Cheers!",
  },

  /* ------------------------------------------------ the rest --------- */
  {
    id: 'cold-email', cat: 'work', format: 'email', seconds: 3.9,
    prompt: 'cold email to a local gym owner, i do video editing, want to pitch making their instagram reels, short',
    output: {
      from: 'Jake Morrow', to: 'Dana at Iron Hill Fitness', subject: 'Your deadlift PR videos',
      body: "Hi Dana,\n\nI've been following Iron Hill's Instagram for a few weeks, and the PR videos are the best thing on there. The one of the 60-year-old pulling 300 got more comments than anything else you've posted this year.\n\nI'm a video editor here in town, and I think you could post three or four of those a week with almost no extra work. You film on your phone like you already do. I cut them into Reels with captions, music and your branding, and send them back ready to post within 48 hours.\n\nI made a quick sample from one of your existing clips so you can see what I mean: [link]\n\nIf it's interesting, I'll do your first five for free. If not, no worries, and keep the PR videos coming either way.\n\nJake Morrow\njakemorrow.video",
    },
    chatgpt: "Subject: Elevate Your Gym's Social Media Presence!\n\nDear [Gym Owner's Name],\n\nI hope this email finds you well! My name is [Your Name], and I am a professional video editor specializing in creating engaging social media content. I would love to help your gym stand out on Instagram with high-quality Reels that showcase your unique community.\n\nWould you be open to a quick call to discuss how I can help? I look forward to hearing from you!\n\nBest,\n[Your Name]",
  },
  {
    id: 'two-weeks', cat: 'work', format: 'email', seconds: 3.4,
    prompt: 'two weeks notice email, i actually liked working there, leaving for a job closer to home',
    output: {
      from: 'Anna Walsh', to: 'Tom Brooks', subject: 'My last day will be June 14',
      body: "Hi Tom,\n\nI wanted you to hear this from me first. I've accepted a position closer to home, and my last day here will be Friday, June 14.\n\nThis wasn't an easy call. I've learned more on this team in three years than anywhere else I've worked, and a lot of that is because you let me take on things I probably wasn't ready for. The commute just finally won.\n\nOver the next two weeks I'll write up where everything stands on the Carver project and walk Jess through the vendor calls. If there's anything else you want handed off, tell me and I'll get it done.\n\nThank you, really.\n\nAnna",
    },
    chatgpt: "Subject: Resignation Notice\n\nDear [Manager's Name],\n\nPlease accept this email as formal notice of my resignation from my position at [Company Name], effective two weeks from today. I have accepted a position that is closer to home.\n\nI am grateful for the opportunities I have had during my time here and will do everything I can to ensure a smooth transition.\n\nSincerely,\n[Your Name]",
  },
  {
    id: 'cover-letter', cat: 'work', format: 'page', seconds: 6.7,
    prompt: 'cover letter for a junior graphic designer job at a small coffee roaster, i have a portfolio but no agency experience, i used to be a barista',
    output: {
      title: 'Cover Letter',
      body: "Dear Hiring Team at Low Tide Coffee,\n\nFor four years I pulled shots at a café that sold your Night Swim blend, and I spent a lot of slow afternoons looking at the bag. It's a good bag. The wave that turns into a steam line is the kind of thing I'd want my name on.\n\nI'm applying for the junior designer role. I don't have agency experience. What I have is a portfolio built on real small businesses: menus for two restaurants in my neighborhood, the label system for a friend's hot sauce, which now sits in 30 stores, and a year of Instagram posts for the café where I worked. Every one of those clients had a tight budget and an opinion, which I suspect is true of most roasters.\n\nI also know what happens to packaging after it leaves the designer. I've seen which bags customers pick up and which ones sit on the shelf, and I've had to explain a tasting note to someone who just wants something strong.\n\nMy portfolio is at mayaortiz.design. I'd love to show you how I'd approach a seasonal release.\n\nThanks for reading,\nMaya Ortiz",
    },
    chatgpt: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Junior Graphic Designer position at your company. As a passionate and creative designer with a robust portfolio, I am confident in my ability to contribute to your brand's visual identity.\n\nAlthough I do not have formal agency experience, my background as a barista has given me a unique perspective on the coffee industry. I am eager to bring my skills and enthusiasm to your team.\n\nThank you for considering my application.\n\nSincerely,\n[Your Name]",
  },
  {
    id: 'apology-text', cat: 'personal', format: 'texts', seconds: 2.6,
    prompt: 'apology text to my gf after a fight, i was on my phone the whole time at her sisters birthday dinner and got defensive when she called it out',
    output: {
      contact: 'Lena',
      messages: [
        { me: true, text: "hey. I've been thinking about tonight and you were right." },
        { me: true, text: "I was on my phone basically the whole dinner, at your sister's birthday, and when you said something I made it about how you said it instead of what I did. That wasn't fair." },
        { me: true, text: "I'm sorry. I'm going to text Nat tomorrow and apologize to her too." },
        { me: true, text: 'No need to reply tonight. I love you' },
      ],
    },
    chatgpt: "Hey babe, I just wanted to say I'm truly sorry about tonight. I realize I was on my phone during your sister's birthday dinner, and that was disrespectful. I also shouldn't have gotten defensive when you brought it up. Your feelings are completely valid, and I promise to be more present in the future. I love you! ❤️",
  },
  {
    id: 'eulogy', cat: 'personal', format: 'page', seconds: 8.1,
    prompt: 'eulogy for my grandpa walt. he was a mailman for 35 years, fixed everything himself, terrible at jokes but told them anyway. keep it under 3 min',
    output: {
      title: 'For Grandpa Walt',
      body: "My grandpa Walt carried mail for 35 years. He liked to say he'd walked to the moon and halfway back, and he had done the math to prove it, on the back of a Sears envelope he kept in his wallet.\n\nThat was Grandpa. If something could be figured out, he figured it out himself. He fixed his own car, his own roof, and every toaster anyone in this family ever owned. When I was nine I broke the chain on my bike and cried about it. He didn't tell me it was okay. He handed me a wrench, sat down on an overturned bucket, and talked me through it for an hour, even though he could have done it in five minutes.\n\nHe also told the worst jokes I have ever heard. Most of them were about dogs and mailmen. He'd tell the same one every Thanksgiving, laugh before the punchline, and then forget the punchline. We laughed anyway. Honestly, that was the joke.\n\nI've been thinking this week about what he'd want us to take from today. I think it's pretty simple. Show up. Do the work yourself when you can. Be kind to the dog, even if it bites. And tell the joke, even if you're going to mess it up.\n\nWe love you, Grandpa. Thanks for teaching us how to fix things.",
    },
    chatgpt: "Today, we gather to celebrate the life of a truly remarkable man, my grandfather, Walt. For 35 years, he dedicated himself to serving his community as a mail carrier. He was a man of many talents, always ready to fix anything that was broken. And who could forget his jokes? While they may not always have landed, they always came from a place of love.\n\nGrandpa, you will be deeply missed, but your legacy will live on in all of us. Rest in peace.",
  },
  {
    id: 'history-essay', cat: 'school', format: 'page', seconds: 8.9,
    prompt: '5 paragraph essay on why the berlin wall fell, 10th grade, needs a thesis',
    output: {
      title: 'Why the Berlin Wall Fell',
      body: "On the night of November 9, 1989, thousands of East Berliners walked up to the checkpoints of the Berlin Wall and demanded to be let through. Before midnight, the guards gave up and opened the gates. The wall had stood for 28 years, and it seemed to fall in a single evening. It didn't really fall that fast. The Berlin Wall came down because the Soviet Union stopped backing East Germany, because East Germany's economy was failing its people, and because ordinary citizens finally refused to stay quiet.\n\nThe first crack came from Moscow. When Mikhail Gorbachev became the Soviet leader in 1985, he introduced reforms called glasnost, meaning openness, and perestroika, meaning restructuring. He also made it clear that the Soviet army would no longer crush uprisings in Eastern Europe the way it had in Hungary in 1956 and Czechoslovakia in 1968. East Germany's leaders had always depended on that threat. Without it, their power was much weaker than it looked.\n\nThe second problem was money. By the 1980s, East Germany was deep in debt to Western banks. People waited years to buy a car, and stores often ran short of basic goods. Meanwhile, many East Germans could watch West German television and see what life looked like on the other side. The contrast made it hard for the government to claim its system was working.\n\nThe final push came from the people themselves. In the summer of 1989, Hungary opened its border with Austria, and thousands of East Germans fled west through it. Those who stayed began protesting. In Leipzig, weekly Monday demonstrations grew to about 70,000 people by early October. Then, on November 9, a government spokesman named Günter Schabowski announced new travel rules at a press conference. When a reporter asked when they took effect, he said \"immediately\" by mistake. Crowds rushed to the wall that night.\n\nThe Berlin Wall fell because the forces holding it up disappeared one by one. The Soviet Union would not defend it, the economy could not justify it, and the people would not accept it. Schabowski's mistake may have opened the gates, but the wall had already lost everything that kept it standing. Less than a year later, Germany was reunified.",
    },
    chatgpt: "The fall of the Berlin Wall in 1989 was a pivotal moment in world history. This essay will explore the various factors that contributed to its collapse, including political, economic, and social forces.\n\nFirst, political changes in the Soviet Union played a crucial role. Second, economic difficulties in East Germany created widespread dissatisfaction. Third, mass protests demonstrated the power of ordinary citizens.\n\nIn conclusion, the fall of the Berlin Wall was the result of a complex interplay of factors that ultimately led to the reunification of Germany.",
  },
  {
    id: 'professor-extension', cat: 'school', format: 'email', seconds: 2.4,
    prompt: 'email to my professor asking for an extension on the lab report, i had covid last week, dont want to sound like im making excuses',
    output: {
      from: 'Sam Reyes', to: 'Professor Okafor', subject: 'BIO 210 lab report extension request',
      body: "Dear Professor Okafor,\n\nI tested positive for COVID last Monday and was sick for most of the week, so I wasn't able to finish the Lab 6 report due this Friday. I'm feeling better now and have the data analysis done, but I still need to write the discussion section.\n\nWould it be possible to turn it in by next Wednesday instead? I'm happy to send a copy of my test result or a note from the health center if that helps.\n\nThank you for considering it.\n\nBest,\nSam Reyes\nBIO 210, Section 3",
    },
    chatgpt: "Subject: Request for Extension on Lab Report\n\nDear Professor [Last Name],\n\nI hope you are doing well. I am writing to respectfully request an extension on the upcoming lab report. Unfortunately, I contracted COVID-19 last week, which significantly impacted my ability to complete my coursework.\n\nI would be extremely grateful for any additional time you could provide. Thank you for your understanding.\n\nSincerely,\n[Your Name]",
  },
  {
    id: 'ig-caption', cat: 'social', format: 'instagram', seconds: 1.8,
    prompt: 'instagram caption for a pic of me and my friends at the beach at sunset, last trip before we all move to different cities',
    output: {
      handle: 'jules.m', image: 'five friends, beach, sunset',
      caption: "last one before the group chat becomes the only place we all live 🌅\nsame beach we found freshman year, same bad speaker, same argument about whose turn it is to get ice. see you in four different time zones",
    },
    chatgpt: "Chasing sunsets with my favorite people 🌅✨ Here's to endless memories and new adventures ahead! No matter where life takes us, we'll always have this moment. 💕 #BestFriends #SunsetVibes #NewChapter #Grateful",
  },
  {
    id: 'food-truck-thread', cat: 'social', format: 'thread', seconds: 4.7,
    prompt: 'tweet thread about what i learned running a food truck for a year, funny but useful',
    output: {
      name: 'Rosa Vega', handle: 'rosatacotruck',
      posts: [
        "I ran a taco truck for a year. I made money, lost money, and got towed once during the lunch rush. Here's what I wish someone had told me 🧵",
        'The food is maybe half of it. The other half is parking. We made $300 one Tuesday and $2,100 the next. Same menu, three blocks apart.',
        'Your menu should fit on a sign someone can read from across the street. We started with 14 items and ended with 5. Sales went up.',
        'Generators are loud and neighbors remember. Buy the quiet one even though it costs twice as much.',
        'Office parks at 11:45 are gold. Breweries at 7pm are gold. Farmers markets are mostly a way to get sunburned and sell 30 tacos.',
        "The truck will break. Not might. Will. Keep a mechanic's number in your favorites like it's your mom's.",
        'Best thing I did all year: learned my regulars\' names. Worst thing: the towing. Would I do it again? Yeah. But I\'d park better.',
      ],
    },
    chatgpt: "1/ 🚚 One year of running a food truck: here are my top lessons learned! 🌮 A thread 🧵\n\n2/ Location is everything! Finding the right spot can make or break your day.\n\n3/ Keep your menu simple. Less is more!\n\n4/ Always be prepared for the unexpected. 🔧\n\n5/ Most importantly, build relationships with your customers! ❤️ #FoodTruck #SmallBusiness",
  },
  {
    id: 'dating-bio', cat: 'social', format: 'profile', seconds: 2.9,
    prompt: 'dating app bio, im 29, nurse, i like rock climbing and making bread, want it to be funny not try-hard',
    output: {
      name: 'Ava', age: 29, details: 'Nurse · Denver',
      prompts: [
        { q: 'My most irrational fear', a: "Running out of flour mid-recipe. I've driven to the store in scrubs at 11pm for this." },
        { q: 'A typical Sunday', a: 'Climbing in the morning, bread in the oven by 2, asleep on the couch by 9. I work nights, give me a break.' },
        { q: "I'll fall for you if", a: "You can tell a good story and don't mind being fed test loaves." },
      ],
    },
    chatgpt: "Nurse by day, adventurer by weekend! 🧗‍♀️🍞 I love rock climbing, baking fresh bread, and exploring new places. Looking for someone who can keep up with my active lifestyle and enjoys the simple things in life. Let's rise to new heights together! 😉",
  },
  {
    id: 'airline-complaint', cat: 'personal', format: 'page', seconds: 5.2,
    prompt: 'complaint to an airline, they lost my bag for 6 days on my honeymoon, i had to buy clothes, want reimbursement, keep it professional but they need to know this sucked',
    output: {
      title: 'Letter to Customer Relations',
      body: "Dear Customer Relations,\n\nOn May 3, my husband and I flew from Chicago to Lisbon on flight 482 to start our honeymoon. My checked bag didn't arrive. I filed a report at the airport (reference LIS-20931) and was told it would be delivered within 24 hours. It arrived six days later, the morning before we flew home.\n\nFor most of our honeymoon, I wore clothes I bought in a hurry at a mall outside the city. I spent our second day on the phone with your baggage line instead of at the beach we'd planned the trip around. Some of what was in that bag, like the dress I'd bought for our anniversary dinner, I never got to use.\n\nI'm asking to be reimbursed for the essentials I had to buy, which total $614.20. Itemized receipts are attached. I'd also like you to consider additional compensation for the disruption. I understand bags get delayed, but six days, on a trip we saved two years for, is more than an inconvenience.\n\nI'd appreciate a response within 14 days. You can reach me at this email or the number below.\n\nSincerely,\nCarla Mendes",
    },
    chatgpt: "Dear [Airline Name] Customer Service,\n\nI am writing to express my deep dissatisfaction with the handling of my luggage on a recent flight. My bag was delayed for six days during my honeymoon, causing significant inconvenience and distress. As a result, I was forced to purchase essential clothing and toiletries.\n\nI kindly request reimbursement for these expenses. I trust you will address this matter promptly.\n\nSincerely,\n[Your Name]",
  },
  {
    id: 'cabin-listing', cat: 'creative', format: 'listing', seconds: 4.1,
    prompt: 'airbnb description for my cabin, 2br, near a lake, no wifi (on purpose), wood stove, good for couples or small families',
    output: {
      title: 'Quiet lake cabin with a wood stove. No Wi-Fi, on purpose.',
      meta: 'Entire cabin · 4 guests · 2 bedrooms · 1 bath', rating: '4.97',
      body: "This is a small cabin on a quiet road, a five-minute walk from Pine Lake. There's no Wi-Fi, and that's on purpose. Most guests tell us it's the best part.\n\nInside there are two bedrooms (one queen, one set of bunk beds), a kitchen stocked with real pans and a French press, and a wood stove that heats the whole place. We leave a full rack of split wood and a laminated card on how to light it, which you won't need after the first night.\n\nMornings are best on the porch. You'll hear loons if you're up early. The lake has a small public beach and a dock where kids fish for sunnies. There's a canoe under the porch and paddles in the shed.\n\nGood for couples who want a weekend with no screens, or a small family who wants their kids to discover board games. Cell service works on the porch, one bar, if you need it.",
    },
    chatgpt: "Escape to our charming 2-bedroom cabin nestled near a serene lake! 🌲 Perfect for couples or small families looking to disconnect and unwind. Cozy up by the wood stove, enjoy breathtaking views, and embrace a digital detox (no Wi-Fi!). This hidden gem offers the perfect blend of rustic charm and modern comfort. Book your unforgettable getaway today!",
  },
  {
    id: 'bedtime-story', cat: 'creative', format: 'page', seconds: 6.0,
    prompt: 'short bedtime story for my 5 yr old about a turtle who is scared of the dark, calming, 2 min read',
    output: {
      title: 'Pip and the Dark',
      body: "Pip was a small turtle who lived by a pond, and Pip did not like the dark.\n\nEvery night when the sun went down, the pond turned from green to gray to black, and Pip pulled his head all the way into his shell and squeezed his eyes shut.\n\n\"Why are you hiding?\" asked a frog one night.\n\n\"The dark is too big,\" said Pip. \"I can't see anything.\"\n\n\"That's true,\" said the frog. \"But you can hear things. Try it.\"\n\nSo Pip listened. He heard the water lapping at the rocks, slow and soft, like someone breathing. He heard crickets singing the same little song over and over. Far away, an owl said hoo, and then it was quiet again.\n\n\"The dark has sounds,\" said Pip.\n\n\"It has lights, too,\" said the frog. \"Look up.\"\n\nPip poked his head out, just a little. The sky over the pond was full of stars. And down by the reeds, tiny fireflies were blinking on and off, on and off, like they were saying goodnight.\n\nPip stretched his neck all the way out. The dark didn't feel so big anymore. It felt soft, like a blanket someone had tucked over the whole pond.\n\nHe yawned a big turtle yawn.\n\n\"Goodnight, frog,\" said Pip.\n\n\"Goodnight, Pip,\" said the frog.\n\nAnd Pip fell asleep with his head out, listening to the water breathe.",
    },
    chatgpt: "Once upon a time, in a peaceful pond, there lived a little turtle named Timmy. Timmy was afraid of the dark. One night, a wise old owl said, \"Timmy, the dark is nothing to be afraid of. It's full of wonderful things!\" Timmy looked up and saw the beautiful stars twinkling above. From that night on, Timmy was never afraid of the dark again. The end. 🐢✨",
  },
  {
    id: 'wedding-toast', cat: 'creative', format: 'page', seconds: 5.9,
    prompt: 'wedding toast for my best friend kayla, maid of honor, we met in 6th grade, her husband is marcus, sweet and a little funny, 90 seconds',
    output: {
      title: 'Maid of Honor Toast',
      body: "Hi everyone. I'm Tess, and I've been Kayla's best friend since sixth grade, when she sat down next to me at lunch and said, \"Your sandwich looks sad. Want half of mine?\" It was a Lunchable. I said yes. That's been our friendship ever since. She notices when things are sad, and she shares whatever she has.\n\nI've seen Kayla through braces, a truly unfortunate year of side bangs, three apartments, and one very dramatic haircut we don't talk about. I've seen her date some people. We don't talk about them either.\n\nAnd then there was Marcus. The first time she told me about him, she didn't say he was cute, or funny, even though he's both. She said, \"He asked me a question and then actually listened to the answer.\" I knew right then.\n\nMarcus, you're getting someone who will show up for you every single time. Someone who remembers everything, including the stuff you'd rather she forgot. Someone who will always give you half her sandwich.\n\nSo everyone, please raise a glass. To Kayla and Marcus. May you always have someone to share lunch with.",
    },
    chatgpt: "Good evening, everyone! For those who don't know me, I'm [Your Name], and I have had the honor of being Kayla's best friend since sixth grade. Kayla, you are kind, loyal, and truly one of a kind. Marcus, thank you for making my best friend so happy. You two are perfect for each other.\n\nPlease raise your glasses to Kayla and Marcus! Here's to a lifetime of love and laughter! 🥂",
  },
];

/* Filter buttons shown above the grid. */
window.ABG_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'school', label: 'School' },
  { id: 'social', label: 'Social' },
  { id: 'creative', label: 'Creative' },
];

/* Hero placeholder rotation. */
window.ABG_PLACEHOLDERS = [
  'a text to my landlord about the broken heater',
  'my college essay about quitting soccer',
  'a best man speech for my little brother',
  'an email asking my boss for a raise',
  'a eulogy for my grandpa',
  'a breakup text that isn\'t cruel',
  'a cover letter for a coffee shop design job',
];
