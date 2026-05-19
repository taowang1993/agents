# Dex Horthy - Advanced Context Engineering for Coding Agents

[0:13] [music]
[0:20] Hi everybody. How y'all doing?
[0:24] >> It's exciting. I'm Dex. Uh, as they did
[0:26] in the great intro, I've been hacking on
[0:27] agents for a while. Um, our talk 12
[0:30] factor agents at AI engineer in June was
[0:32] one of the top talks of all time. Uh, I
[0:35] think top eight or something. One of the
[0:36] best ones from from AI engineer in June.
[0:38] May or may not have said something about
[0:39] context engineering. Um, why am I here
[0:42] today? What am I here to talk about? Um,
[0:44] I want to talk about one of my favorite
[0:45] talks from AI engineer in June. And I
[0:47] know we all got the update from Eigor
[0:48] yesterday, but they wouldn't let me
[0:50] change my slides. So, this is going to
[0:51] be about what Eigor talked about in
[0:53] June. uh basically that they surveyed a
[0:55] 100,000 developers across all company
[0:57] sizes and they found that most of the
[0:59] time you use AI for software engineering
[1:01] you're doing a lot of rework a lot of
[1:02] codebase churn uh and it doesn't really
[1:05] work well for complex tasks brownfield
[1:07] code bases um and you can see in the
[1:10] chart basically you are shipping a lot
[1:11] more but a lot of it is just reworking
[1:13] the slop that you shipped last week so
[1:16] uh and then the other side right was
[1:18] that uh if you're doing green field
[1:20] little versel dashboard something like
[1:22] this then it's going to work great. Uh
[1:25] if you're going to go in a 10-year-old
[1:27] Java at codebase, maybe not so much. And
[1:29] this matched my experience personally
[1:31] and talking to a lot of founders and
[1:32] great engineers, too much slop uh tech
[1:35] debt factory. It's just it's not going
[1:36] to work from our codebase. Like maybe
[1:37] someday when the models get better, but
[1:40] that's what context engineering is all
[1:41] about. How can we get the most out of
[1:43] today's models? How do we manage our
[1:45] context window? So we talked about this
[1:47] in August. Um I have to confess
[1:49] something. The first time I used cloud
[1:51] code, I was not impressed. It was like,
[1:53] okay, this is a little bit better. I get
[1:54] it. I like the UX. Um, but since then,
[1:57] we as a team figured something out. Um,
[2:00] that we were actually able to get, you
[2:01] know, 2 to 3x more throughput. And we
[2:03] were shipping so much that we had no
[2:05] choice but to change the way we
[2:07] collaborated. We rewired everything
[2:09] about how we build software. Uh, it was
[2:11] a team of three. It took eight weeks. It
[2:13] was really freaking hard. Uh, but now
[2:15] that we solved it, we're we're never
[2:16] going back. This is the whole no slop
[2:18] thing. I think I think we got somewhere
[2:20] with this went super viral on HackerNews
[2:22] in September. Uh we have thousands of
[2:24] folks who have gone on to GitHub and
[2:25] grabbed our you know research plan
[2:26] implement prompt system. Um so the goals
[2:29] here which we kind of backed our way
[2:31] into we need AI that can work well in
[2:34] brownfield code bases that can solve
[2:36] complex problems. No slop, right? No
[2:39] more slop. Uh and we had to maintain
[2:42] mental alignment. I'll talk a little bit
[2:43] more about what that means in a minute.
[2:44] And of course we want to spend with
[2:46] everything we want to spend as many
[2:47] tokens as possible. what we can offload
[2:48] meaningfully to the AI is really really
[2:51] important. Um, super high leverage. So,
[2:53] this is advanced context engineering for
[2:55] coding agents. Um, I'll start with kind
[2:57] of like framing this. The most naive way
[3:00] to use a coding agent is to ask it for
[3:02] something and then tell it why it's
[3:03] wrong and resteere it and ask and ask
[3:05] and ask until you run out of context or
[3:07] you give up or you cry. Um, we can be a
[3:10] little bit smarter about this. Most
[3:11] people discover this pretty early on in
[3:13] their AI like exploration. uh is that it
[3:17] might be better if you start a
[3:18] conversation and you're off track that
[3:22] uh you just start a new context window.
[3:24] You say, "Okay, we went down that path.
[3:25] Let's start again. Same prompt, same
[3:26] task, but this time we're going to go
[3:28] down this path and like don't go over
[3:29] there cuz that doesn't work." So, uh how
[3:32] do you know when it's time to start
[3:34] over?
[3:35] If you see this,
[3:39] it's probably time to start over, right?
[3:41] This is what Claude says when you tell
[3:43] it it's screwing up.
[3:46] Um, so we can be even smarter about
[3:47] this. We can do what I call intentional
[3:49] compaction. Um, and this is basically
[3:51] whether you're on track or not, you can
[3:53] take uh your existing context window and
[3:56] ask the agent to compress it down into a
[3:58] markdown file. You can review this, you
[4:00] can tag it, and then when the new agent
[4:01] starts, it gets straight to work instead
[4:03] of having to do all that searching and
[4:04] codebase understanding and getting
[4:06] caught up. Um, what goes into
[4:08] compaction? Well, the question is like
[4:10] what takes up space in your context
[4:12] window. So, um, it's looking for files,
[4:15] it's understanding code flow, it's
[4:17] editing files, it's test and build
[4:19] output. And if you have one of those
[4:20] MCPs that's dumping JSON and a bunch of
[4:22] UU ids into your context window, you
[4:25] know, God help you. Uh, so what should
[4:28] we compact? I'll get more specifics
[4:29] here, but this is a really good
[4:30] compaction. This is exactly what we're
[4:32] working on. The exact files and line
[4:34] numbers that matter to the problem that
[4:35] we're solving. Um, why are we so
[4:38] obsessed with context? Because LMS are
[4:41] actually got roasted on YouTube for this
[4:42] one. And they're not pure functions cuz
[4:43] they're nondeterministic, but they are
[4:45] stateless. And the only way to get
[4:46] better better performance out of an LLM
[4:49] is to put better tokens in and then you
[4:51] get better tokens out. And so every turn
[4:53] of the loop when Claude is picking the
[4:54] next tool or any coding agent is picking
[4:56] the next and there could be hundreds of
[4:57] right next steps and hundreds of wrong
[4:59] next steps. But the only thing that
[5:01] influences what comes out next is what
[5:03] is in the conversation so far. So we're
[5:05] going to optimize this context window
[5:07] for correctness, completeness, size, and
[5:10] a little bit of trajectory. And the
[5:11] trajectory one is interesting because a
[5:13] lot of people say, "Well, I I told the
[5:14] agent to do something and it did
[5:16] [clears throat] something wrong. So, I
[5:17] corrected it and I yelled at it and then
[5:19] it did something wrong again and then I
[5:20] yelled at it." And then the LM is
[5:21] looking at this conversation says,
[5:23] "Okay, cool. I did something wrong. The
[5:24] human yelled at me and then I did
[5:25] something wrong and the human yelled at
[5:26] me." So, the next most likely conver
[5:27] token in this conversation is I better
[5:30] do something wrong so the human can yell
[5:31] at me again. So, mind be mindful of your
[5:34] trajectory. If you were going to invert
[5:36] this, the worst thing you can have is
[5:37] incorrect information, then missing
[5:39] information, and then just too much
[5:41] noise. Um, if you like equations,
[5:43] there's a dumb equation if you want to
[5:45] think about it this way. Um, Jeff
[5:48] Huntley uh did a lot of research on
[5:49] coding agents. Uh, he put it really
[5:51] well. Just the more you use the context
[5:53] window, the worse outcomes you'll get.
[5:55] This leads to a concept I'm in a very
[5:56] very academic concept called the dumb
[5:58] zone. So, you have your context window.
[6:01] You have 168,000 tokens roughly. Some
[6:03] are reserved for output and compaction.
[6:05] This varies by model. Um, but we'll use
[6:07] cloud code as an example here. Around
[6:09] the 40% line is where you're going to
[6:10] start to see some diminishing returns
[6:12] depending on your task. Um, if you have
[6:15] too many MCPs in your coding agent, you
[6:17] are doing all your work in the dumb zone
[6:18] and you're never going to get good
[6:20] results. People talked about this. I'm
[6:22] not going to talk about that one. Your
[6:23] mileage may vary. 40% is like it depends
[6:24] on how complex the task is, but this is
[6:26] kind of a good guideline. Um so back to
[6:29] compaction or as I will call it from now
[6:31] on cleverly avoiding the dumb zone. Um
[6:35] we can do sub agents. Um if you have a
[6:37] front-end sub aent and a backend sub
[6:39] aent and a QA sub aent and a data data
[6:41] scientist sub aent
[6:43] please stop. Sub aents are not for
[6:46] anthropomorphizing roles. They are for
[6:47] controlling context. And so what you can
[6:49] do is if you want to go find how
[6:51] something works in a large codebase um
[6:53] you can steer the coding agent to do
[6:55] this if it supports sub agents or you
[6:56] can build your own sub agent system. But
[6:58] basically you say hey go find how this
[7:00] works and it can fork out a new context
[7:02] window that is going to go do all that
[7:04] reading and searching and finding and
[7:06] reading entire files and understanding
[7:08] the codebase and then just return a
[7:11] really really succinct message back up
[7:13] to the parent agent of just like hey the
[7:15] file you want is here. parent agent can
[7:18] read that one file and get straight to
[7:20] work. And so this is really powerful. If
[7:22] you wield these correctly, you can get
[7:24] good responses like this and then you
[7:26] can manage your context really, really
[7:27] well. Um, what works even better than
[7:29] sub agents or like a layer on top of sub
[7:31] aents is a workflow I call frequent
[7:33] intentional compaction. We're going to
[7:35] talk about research plan implement in a
[7:37] minute, but like the point is you're
[7:38] constantly st keeping your context
[7:40] window small. You're building your
[7:42] entire workflow around context
[7:44] management. So comes in three phases.
[7:46] research, plan, implement. Um, and we're
[7:49] going to try to stay in the smart zone
[7:50] the whole time. So, the research is all
[7:52] about understanding how the system
[7:53] works, finding the right files, staying
[7:55] objective. Here's a prompt you can use
[7:57] to do research. Here's the output of um,
[7:59] a research prompt. These are all open
[8:01] source. You can go grab them and play
[8:02] with them yourself. Um, planning, you're
[8:05] going to outline the exact steps. You're
[8:06] going to include file names and line
[8:07] snippets. You're going to be very
[8:08] explicit about how we're going to test
[8:09] things after every change. Here's a good
[8:11] planning prompt. Here's one of our
[8:13] plans. It's got actual code snippets in
[8:14] it. Um, and then we're gonna implement.
[8:16] And if you read one of these plans, you
[8:18] can see very easily how the dumbest
[8:20] model in the world is probably not going
[8:21] to screw this up. Um, so we just go
[8:23] through and we run the plan and we keep
[8:25] the context low. As a planning prompt,
[8:27] like I said, it's the least exciting
[8:28] part of the process. Um, I wanted to put
[8:30] this into practice. So, working for us,
[8:32] uh, I do a podcast with my buddy uh,
[8:34] Vibv, who's the CEO of a company called
[8:35] Boundary ML. Uh, and I said, "Hey, I'm
[8:38] going to try to oneshot a fix to your
[8:39] 300,000line Rust codebase for a
[8:41] programming language."
[8:43] Um, and the whole episode goes in, it's
[8:45] like an hour and a half. Uh, I'm not
[8:46] going to talk through it right now, but
[8:47] we built a bunch of research and then we
[8:48] threw them out because they were bad.
[8:49] And then we made a plan and we made a
[8:50] plan without research and with research
[8:52] and compared all the results. It's a fun
[8:53] time. Uh, by that was Monday night. By
[8:56] Tuesday morning, we were on the show and
[8:57] the CTO had like seen the PR and like
[9:00] didn't realize I was doing it as a bit
[9:01] for a podcast and basically was like,
[9:03] "Yeah, this looks good. We'll get in the
[9:04] next release." He I think he was a
[9:06] little confused. Um, here's the the
[9:08] plan. But anyways, uh, yeah, confirmed
[9:11] works in brownfield code bases and no
[9:14] slop. But I wanted to see if we could
[9:16] solve complex problems. So, Vib was
[9:18] still a little skeptical. I sat down, we
[9:20] sat down for like 7 hours on a Saturday
[9:21] and we shipped 35,000 lines of code to
[9:24] BAML. One of the PRs got merged like a
[9:26] week later. I will say some of this is
[9:28] codegen. You know, you update your
[9:29] behavior. All the golden files update
[9:31] and stuff, but we shipped a lot of code
[9:32] that day. Um, he estimates it was about
[9:34] 1 to 2 weeks and 7 hours. And uh, so
[9:37] cool. We can solve complex problems.
[9:40] There are limits to this. I sat down
[9:41] with my buddy Blake. We tried to remove
[9:43] Hadoop dependencies from Parket Java. If
[9:46] you know what Paret Java is, I'm sorry
[9:49] uh for whatever happened to you to get
[9:51] you to this point in your career. Uh it
[9:53] did not go well. Uh here's the plans,
[9:55] here's the research. Uh at a certain
[9:57] point, we threw everything out and we
[9:58] actually went back to the whiteboard. We
[10:00] had to actually once we had learned
[10:01] where were the where all the foot guns
[10:03] were, we we went back to okay, how is
[10:05] this actually going to fit together? Um,
[10:07] and this brings me to a really
[10:08] interesting point that Jake's going to
[10:09] talk about later. Uh, do not outsource
[10:12] the thinking. AI cannot replace
[10:14] thinking. It can only amplify the
[10:16] thinking you have done or the lack of
[10:17] thinking you have done. So people ask,
[10:20] so Dex, this is specri development,
[10:22] right? No, specri development is broken.
[10:28] Not the idea, but the phrase. Um,
[10:32] it's not well defined. This is Brietta
[10:34] from Thought Works. Um, and a lot of
[10:36] people just say spec and they mean a
[10:37] more detailed prompt. Does anyone
[10:40] remember this picture? Does anyone know
[10:41] what this is from? All right, that's a
[10:43] deep cut. Uh, there will never be a year
[10:45] of agents because of semantic diffusion.
[10:47] Martin Fowler said this in 2006. We come
[10:49] up with a good term with a good
[10:51] definition and then everybody gets
[10:53] excited and everybody starts meaning it
[10:55] to mean a hundred things to a 100
[10:56] different people and it becomes useless.
[10:59] We had an agent is a person, an agent is
[11:01] a micros service. An agent is a chatbot.
[11:03] An agent is a workflow. And thank you,
[11:05] Simon. We're back to the beginning. An
[11:07] agent is just tools in a loop. Um, this
[11:10] is happening to spec driven dev. I used
[11:12] to have Sean's uh slide in the beginning
[11:14] of this talk, but it caused a bunch of
[11:15] people to focus on the wrong things. His
[11:17] thing of like, forget the code. It's
[11:18] like assembly now and you just focus on
[11:20] the markdown. Very cool idea, but people
[11:23] say Spectrum Dev is writing a better
[11:24] prompt, a product requirements document.
[11:26] Sometimes it's using like verifiable
[11:28] feedback loops and back pressure. Maybe
[11:30] it is treating the code like assembly
[11:32] like Sean taught us. Um, but a lot of
[11:34] people is just using a bunch of markdown
[11:35] files while you're coding. Or my
[11:37] favorite, I just stumbled upon this last
[11:39] week. Uh, a spec is documentation for an
[11:42] open source library. So it's gone. It's
[11:44] as specri dev is overhyped. It's useless
[11:47] now. It's semantically diffused.
[11:50] Um, so I want to talk about like four
[11:52] things that actually work today. The
[11:54] tactical and practical steps that we
[11:55] found working internally and with a
[11:57] bunch of users. Um, we do the research,
[11:59] we figure out how the system works. Um,
[12:02] remember Momento? This is the best the
[12:04] best movie on context engineering, as
[12:06] Peter says it. Guy wakes up, he has no
[12:08] memory. He has to like read his own
[12:10] tattoos to figure out who he is and what
[12:12] he's up to. If you don't onboard your
[12:14] agents, they will make stuff up. And so,
[12:17] if this is your team, this is very
[12:18] simplified for most of you. Most of you
[12:20] have much bigger orgs than this. But
[12:21] let's say you want to do some work over
[12:22] here. Um, one thing you could do is you
[12:25] could put onboarding into every repo.
[12:27] You put a bunch of context. Here's the
[12:28] repo. Here's how it works. This is a
[12:30] compression of all the context in the
[12:32] codebase that the agent can see ahead of
[12:34] time before actually getting to work.
[12:36] This is challenging because
[12:38] sometimes it gets too long. As your
[12:40] codebase gets really big, you either
[12:41] have to make this longer or you have to
[12:43] leave information out. And so as you uh
[12:47] are reading through this, you're going
[12:49] to read the context of this big 5
[12:50] million line monor repo and you're going
[12:52] to use all the smart zone just to learn
[12:54] how it works. And you're not going to
[12:55] be able to do any good tool calling in the
[12:56] dumb zone. So that's uh you can
[13:01] you can shard this down the stack. You
[13:02] can do they're just talking about
[13:03] progressive disclosure. You could split
[13:04] this up, right? You could just put a
[13:06] file in the root of every repo and then
[13:08] like at every level you have like
[13:10] additional context based on if you're
[13:12] working here, this is what you need to
[13:14] know. Uh we don't document the files
[13:16] themselves cuz they're the source of
[13:17] truth. But then as your agent is
[13:19] working, you know, you pull in the root
[13:20] context and then you pull in the
[13:21] subcontext. We won't talk about any
[13:22] specific like you could use cloudd for
[13:24] this, you can use hooks for this,
[13:25] whatever it is. Um, but then you still
[13:27] have plenty of room in the smart zone
[13:28] because you're only pulling in what you
[13:29] need to know. Um, the problem with this
[13:32] is that it gets out of date. And so
[13:34] every time you ship a new feature, you
[13:36] need to kind of like cache and validate
[13:38] and rebuild large parts of this internal
[13:40] documentation. And you could use a lot
[13:43] of AI and make it part of your process
[13:44] to update this. Um, but I want to ask a
[13:48] question between the actual code, the
[13:49] function names, the comments, and the
[13:50] documentation. Does anyone want to guess
[13:52] what is on the y-axis of this chart?
[13:57] slop
[13:57] >> slop. It's actually the amount of lies
[14:00] you can find in any one part of your
[14:02] codebase.
[14:04] Um, so you could make a part of your
[14:05] process to update this, but you probably
[14:07] shouldn't cuz you probably won't. What
[14:08] we prefer is on demand compressed
[14:10] context. So if I'm building a feature
[14:12] that relates to SCM providers and Jira
[14:14] and Linear, um, I would just give it a
[14:16] little bit of steering. I would say,
[14:17] hey, we're going over in like this like
[14:19] part of the codebase over here. Um, and
[14:22] a good research uh prompt or or slash
[14:24] command might take you or skill even uh
[14:27] launch a bunch of sub aents to take
[14:29] these vertical slices through the
[14:30] codebase and then build up a research
[14:32] document that is just a snapshot of the
[14:34] actually true based on the code itself
[14:37] parts of the codebase that matter. We
[14:39] are compressing truth. Um, planning is
[14:42] leverage. Planning is about compression
[14:44] of intent. Um, and in plan we're going
[14:46] to outline the exact steps. We take our
[14:49] research and our PRD or our bug ticket
[14:50] or our whatever it is and we create a
[14:52] plan and we create a plan file. So we're
[14:54] compacting again. And I want to pause to
[14:56] talk about mental alignment. Um does
[14:58] anyone know what code review is for?
[15:03] >> Mental alignment. Mental alignment is it
[15:06] is about finding making sure things are
[15:07] correct and stuff but the most important
[15:09] thing is how do we keep everybody on the
[15:10] team on the same page about how the
[15:12] codebase is changing and why. And I can
[15:14] read a thousand lines of Golang every
[15:16] week. Uh sorry I can't read a thousand.
[15:18] It's hard. I can do it. I don't want to.
[15:20] Um, and as our team grows, I all the
[15:22] code gets reviewed. We don't not read
[15:24] the code, but I, as you know, a
[15:25] technical leader in the in on the team,
[15:27] I can read the plans and I can keep up
[15:29] to date and I can that's enough. I can
[15:31] catch some problems early and I maintain
[15:33] understanding of how the system is
[15:34] evolving. Um, Mitchell had this really
[15:36] good post about how he's been putting
[15:37] his AMP threads on his pull requests so
[15:39] that you can see not just, hey, here's a
[15:41] wall of green text in GitHub, but here's
[15:43] the exact steps, here's the prompts, and
[15:44] hey, I ran the build at the end and it
[15:46] passed. This takes the reviewer on a
[15:48] journey in a way that a GitHub PR just
[15:50] can't. And as you're shipping more and
[15:52] more in two to three times as much code,
[15:54] it's really on you to find ways to keep
[15:57] your team on the same page and show them
[15:59] here's the steps I did and here's how we
[16:00] tested it manually. Um, your goal is
[16:03] leverage. So you want high confidence
[16:04] that the model will actually do the
[16:05] right thing. I can't read this plan and
[16:07] know what actually is going to happen
[16:09] and what code changes are going to
[16:10] happen. So we've over time iterated
[16:12] towards our plans include actual code
[16:15] snippets of what's going to change. So
[16:17] your goal is leverage. You want
[16:18] compression of intent and you want
[16:20] reliable execution. Um and so I don't
[16:22] know I have a physics background. We
[16:23] like to draw lines through the center of
[16:26] peaks and curves. Uh as your plans get
[16:28] longer, reliability goes up, readability
[16:30] goes down. There's a sweet spot for you
[16:32] and your team and your codebase. you
[16:34] should try to find it because when we
[16:35] review the research and the plans, if
[16:37] they're good, then we can get mental
[16:39] alignment. Um, don't outsource the
[16:42] thinking. I've said this before, this is
[16:44] not magic. There is no perfect prompt.
[16:46] You still will not work if you do not
[16:49] read the plan. So, we built our entire
[16:51] process around you, the builder, are in
[16:53] back and forth with the agent reading
[16:55] the plans as they're created. And then
[16:57] if you need peer review, you can send it
[16:58] to someone and say, "Hey, does this plan
[16:59] look right? Is this the right approach?
[17:00] Is this the right order to look at these
[17:02] things?" Um Jake again wrote a really
[17:04] good blog post about like the thing that
[17:05] makes research plan implementing
[17:06] valuable is you the human in the loop
[17:09] making sure it's correct. So if you take
[17:12] one thing away from this talk it should
[17:14] be that a bad line of code is a bad line
[17:16] of code and a bad part of a plan is
[17:20] could be a hundred bad lines of code and
[17:22] a bad line of research like a
[17:24] misunderstanding of how the system works
[17:26] and where things are your whole thing is
[17:28] going to be hosed. You're going to be
[17:29] telling sending the model off in the
[17:30] wrong direction. And so when we're
[17:32] working internally and with users, we're
[17:34] constantly trying to move human effort
[17:36] and focus to the highest leverage parts
[17:38] of this pipeline. Um, don't outsource
[17:40] the thinking. Watch out for tools that
[17:42] just spew out a bunch of markdown files
[17:44] just to make you feel good. I'm not
[17:46] going to name names here. Uh, sometimes
[17:48] this is overkill. And the way I like to
[17:49] think about this is like, yeah, you
[17:51] don't always need a full research plan
[17:53] implement. Sometimes you need more,
[17:55] sometimes you need less. If you're
[17:56] changing the color of a button, just
[17:58] talk to the agent and tell it what to
[17:59] do. Um, if you're doing like a simple
[18:02] plan and as a small feature, if you're
[18:04] doing medium features across multiple
[18:06] repos, then do one research, then build
[18:08] a plan. Basically, the hardest problem
[18:10] you can solve, the ceiling goes up the
[18:12] more of this context engineering
[18:14] compaction you're willing to do. Um, and
[18:16] so if you're in the top right corner,
[18:18] you're probably going to have to do
[18:19] more. A lot of people ask me, "How do I
[18:21] know how much context engineering to
[18:22] use?" It takes reps. You will get it
[18:25] wrong. You have to get it wrong over and
[18:26] over and over again. Sometimes you'll go
[18:27] too big. Sometimes you go too small.
[18:29] Pick one tool and get some reps. I
[18:32] recommend against minmaxing across cloud
[18:34] and codeex and all these different
[18:35] tools. Um, so I'm not a big acronym guy.
[18:39] Uh, we said specri dev was broken. Uh,
[18:42] research plan and implement I don't
[18:44] think will be the steps. The important
[18:45] part is compaction and context
[18:46] engineering and staying in the smart
[18:47] zone. But people are calling this RPI
[18:50] and there's nothing I can do about it.
[18:52] So, uh, just be wary. There is no
[18:54] perfect prompt. There is no silver
[18:55] bullet. Um, if you really want a hypy
[18:58] word, you can call this harness harness
[19:00] engineering, which is part of context
[19:01] engineering, and it's how you integrate
[19:02] with the integration points on codeex,
[19:04] claude, cursor, whatever. How you
[19:06] customize your codebase. Um, so what's
[19:09] next? I think the coding agent stuff is
[19:12] actually going to be commoditized.
[19:13] People are going to learn how to do this
[19:14] and get better at it. And the hard part
[19:16] is going to be how do you adapt your
[19:17] team and your workflow and the SDLC to
[19:20] work in a world where 99% of your code
[19:22] is shipped by AI. Uh, and if you can't
[19:25] figure this out, you're hosed because
[19:26] there's kind of a rift growing where
[19:28] like staff engineers don't adopt AI
[19:29] because it doesn't make them that much
[19:30] faster. And then junior mid-levels
[19:32] engineers use a lot because it fills in
[19:34] skill gaps and then it also produces
[19:36] some slop. And then the senior engineers
[19:37] hate it more and more every week because
[19:39] they're cleaning up slop that was
[19:40] shipped by cursor the week before. Uh,
[19:43] this is not AI's fault. This is not the
[19:44] mid-level engineers fault. Like if
[19:46] cultural change is really hard and it
[19:48] needs to come from the top if it's going
[19:49] to work. So if you're a technical leader
[19:51] at your company, pick one tool and get
[19:53] some reps. If you want to help, we are
[19:56] hiring. We're building an Aentic IDE to
[19:58] help teams of all sizes speedrun the
[20:00] journey to 99% AI generated code. Uh if
[20:04] we'd love to we'd love to talk if you
[20:05] want to work with us. Uh go go hit our
[20:07] website, send us an email, come find me
[20:08] in the hallway. Uh thank you all so much
[20:10] for your energy.
[20:14] [music]
