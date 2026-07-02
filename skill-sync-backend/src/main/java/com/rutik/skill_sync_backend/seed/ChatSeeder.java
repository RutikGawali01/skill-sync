package com.rutik.skill_sync_backend.seed;

import com.rutik.skill_sync_backend.chat.entity.Conversation;
import com.rutik.skill_sync_backend.chat.entity.ConversationParticipant;
import com.rutik.skill_sync_backend.chat.entity.Message;
import com.rutik.skill_sync_backend.chat.enums.ConversationStatus;
import com.rutik.skill_sync_backend.chat.enums.ConversationType;
import com.rutik.skill_sync_backend.chat.enums.MessageStatus;
import com.rutik.skill_sync_backend.chat.enums.MessageType;
import com.rutik.skill_sync_backend.chat.repository.ConversationParticipantRepository;
import com.rutik.skill_sync_backend.chat.repository.ConversationRepository;
import com.rutik.skill_sync_backend.chat.repository.MessageRepository;
import com.rutik.skill_sync_backend.session.entity.Session;
import com.rutik.skill_sync_backend.session.enums.SessionStatus;
import com.rutik.skill_sync_backend.session.repository.SessionRepository;
import com.rutik.skill_sync_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class ChatSeeder {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final MessageRepository messageRepository;
    private final SessionRepository sessionRepository;
    private final Random random = new Random();

    private static final String[][] CONVERSATION_TEMPLATES = {
        {
            "Hi! How are you?",
            "Hello! I am good, thanks. How about you?",
            "Great! Looking forward to our upcoming learning session.",
            "Me too! What topic would you like to cover first?",
            "Can we focus on Spring Boot authentication?",
            "Absolutely. We can cover JWT and security filters.",
            "Awesome! Should I prepare anything in advance?",
            "Just make sure you have Java 21 and Maven installed.",
            "Perfect, I already have those set up.",
            "Great, see you then!",
            "Thanks, see you!"
        },
        {
            "Hey there! Ready for our skill exchange?",
            "Hi! Yes, I am excited.",
            "Awesome. I see you want to learn React.",
            "Yes, I want to learn React Hooks and state management.",
            "Sure, I can teach you that. In return, can you help me with Docker?",
            "Absolutely! I can show you containerization and multi-stage builds.",
            "That sounds fantastic. Let's start with React basics today.",
            "Perfect. Do you have a preferred IDE?",
            "I usually use VS Code.",
            "Sounds good. We can use Google Meet for screen sharing.",
            "Great, I will generate the meeting room link.",
            "See you soon!",
            "Catch you later!"
        },
        {
            "Hello! Thanks for accepting the session invitation.",
            "No problem! Glad to help.",
            "I'm a bit of a beginner with AWS.",
            "Don't worry, we will start from the absolute basics like IAM and EC2.",
            "That's exactly what I need. I get confused with security groups.",
            "We'll configure one step-by-step. It will make sense quickly.",
            "Awesome, thank you so much.",
            "Let's meet at the scheduled time.",
            "Will do. See you online!",
            "See you!"
        },
        {
            "Hello! I saw you are skilled in Python.",
            "Hey! Yes, I've been working with Python for data analysis for about 4 years.",
            "That's awesome. I really need help understanding Pandas and Numpy.",
            "Sure, we can start with basic dataframes and operations.",
            "Perfect. I am offering UI design in exchange, does that work?",
            "Yes, absolutely. I'm building a personal portfolio and need design feedback.",
            "I can review your wireframes and show you some Figma tips.",
            "That sounds like a great trade. Let's schedule our first call.",
            "Awesome. I've sent the invitation details.",
            "Got it! Accepted. See you on Thursday.",
            "Thanks a lot! See you.",
            "By the way, do you have a sample dataset we can use?"
        },
        {
            "Hey! Ready for some SQL optimization tips today?",
            "Definitely! My queries are taking forever to run on PostgreSQL.",
            "No worries, we will look at EXPLAIN plans and index optimizations.",
            "I've heard about indexes but I am not sure when to use composite indexes.",
            "We'll cover that. It depends on your query filter conditions.",
            "Sounds perfect. I can help you with CSS styling in return.",
            "Yes! My layouts keep breaking on mobile screens.",
            "We will look at CSS Grid and Flexbox. You'll master responsiveness in no time.",
            "That would be a lifesaver. I struggle with alignment.",
            "We will fix it step-by-step.",
            "Awesome, looking forward to it.",
            "Should we start with your database queries first?"
        },
        {
            "Hi there! Excited for our session on System Design.",
            "Hello! Yes, design questions make me nervous in interviews.",
            "We'll break down the concepts: load balancing, caching, and replication.",
            "Should we design something specific, like a URL shortener?",
            "Yes! A URL shortener is a perfect starting point to understand database choices.",
            "Great. I will bring my sketchboard tool.",
            "Perfect, see you online!",
            "Will we cover horizontal scale structures?",
            "Yes, we'll talk about partition strategies."
        }
    };

    private static final String[] FOLLOW_UP_POOL = {
        "Let's make sure we write some code during the session.",
        "Yes, hands-on practice is the best way to learn.",
        "I will prepare a small Github repo for us to work on.",
        "That's a great idea, please send me the link.",
        "Done, I'll push the boilerplate code tonight.",
        "I'll pull it and test the configuration on my side.",
        "Perfect, let me know if you run into any setup issues.",
        "Will do. Thanks for setting that up!",
        "No problem, happy to help.",
        "Let me know if there's any specific article I should read before our call.",
        "I'll share a link to a good tutorial blog post.",
        "Excellent, I'll read through it today.",
        "Let's sync up on Zoom if Google Meet has connection issues.",
        "Sure, I have a Zoom account we can use as backup.",
        "Great, see you tomorrow!",
        "Awesome, let's keep the focus on implementation.",
        "I agree, we should build something working."
    };

    @Transactional
    public void clear() {
        log.info("Deleting all chat messages, participants, and conversations...");
        
        // 1. Unlink circular references in latest_message_id
        conversationRepository.findAll().forEach(c -> {
            c.setLatestMessage(null);
            conversationRepository.save(c);
        });

        // 2. Clear messages
        messageRepository.deleteAll();

        // 3. Clear participants
        conversationParticipantRepository.deleteAll();

        // 4. Clear conversations
        conversationRepository.deleteAll();
    }

    @Transactional
    public void seed() {
        log.info("Seeding chat messages for sessions...");
        List<Session> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getStatus() == SessionStatus.ACCEPTED || s.getStatus() == SessionStatus.COMPLETED)
                .toList();

        if (sessions.isEmpty()) {
            log.warn("No accepted or completed sessions found to seed chat history.");
            return;
        }

        for (Session session : sessions) {
            // Check if messages already exist for this session to ensure idempotency
            if (messageRepository.existsBySessionId(session.getId())) {
                log.debug("Session {} already has chat history. Skipping.", session.getId());
                continue;
            }

            User learner = session.getRequester();
            User teacher = session.getProvider();

            // Find or create conversation
            Conversation conversation = conversationParticipantRepository
                    .findDirectConversation(learner.getId(), teacher.getId())
                    .orElse(null);

            if (conversation == null) {
                conversation = Conversation.builder()
                        .type(ConversationType.DIRECT)
                        .status(ConversationStatus.ACTIVE)
                        .deleted(false)
                        .build();
                conversation = conversationRepository.save(conversation);

                ConversationParticipant p1 = ConversationParticipant.builder()
                        .conversation(conversation)
                        .user(learner)
                        .archived(false)
                        .muted(false)
                        .unreadCount(0)
                        .deleted(false)
                        .build();

                ConversationParticipant p2 = ConversationParticipant.builder()
                        .conversation(conversation)
                        .user(teacher)
                        .archived(false)
                        .muted(false)
                        .unreadCount(0)
                        .deleted(false)
                        .build();

                conversationParticipantRepository.save(p1);
                conversationParticipantRepository.save(p2);
            }

            // Determine custom scenario properties
            String nameA = learner.getName();
            String nameB = teacher.getName();
            String first = nameA.compareTo(nameB) < 0 ? nameA : nameB;
            String second = nameA.compareTo(nameB) < 0 ? nameB : nameA;
            String pairKey = first + " <-> " + second;

            int chatLength = random.nextInt(16) + 15;
            LocalDateTime msgTime = session.getCreatedAt().plusHours(2);
            boolean isScenarioB = false;
            boolean isScenarioC = false;
            boolean isScenarioE = false;
            boolean isScenarioF = false;

            if (pairKey.equals("Priya Sharma <-> Rahul Patil") || pairKey.equals("Neha Singh <-> Vikram Rathore")) {
                chatLength = 32;
            } else if (pairKey.equals("Amit Kumar <-> Rahul Patil")) {
                chatLength = 20;
                msgTime = LocalDateTime.now().minusMinutes(70);
                isScenarioB = true;
            } else if (pairKey.equals("Neha Singh <-> Rahul Patil")) {
                chatLength = 18;
                isScenarioF = true;
            } else if (pairKey.equals("Priya Sharma <-> Rohan Mehta")) {
                chatLength = 2;
                isScenarioC = true;
            } else if (pairKey.equals("Amit Kumar <-> Sneha Nair")) {
                chatLength = 15;
                msgTime = LocalDateTime.now().minusDays(6);
            } else if (pairKey.equals("Ananya Iyer <-> Rohan Mehta")) {
                chatLength = 0;
                isScenarioE = true;
            }

            if (isScenarioE) {
                log.info("Scenario E: Created conversation for {} and {} with 0 messages.", nameA, nameB);
                continue;
            }

            String[] customMessages = null;
            if (isScenarioC) {
                customMessages = new String[] {
                    "Hi! Looking forward to our learning session.",
                    "Hello! Me too, see you soon."
                };
            }

            // Generate chat messages
            String[] template = CONVERSATION_TEMPLATES[random.nextInt(CONVERSATION_TEMPLATES.length)];
            Message lastMessage = null;

            for (int i = 0; i < chatLength; i++) {
                String content;
                if (customMessages != null && i < customMessages.length) {
                    content = customMessages[i];
                } else if (i < template.length) {
                    content = template[i];
                } else {
                    content = FOLLOW_UP_POOL[(i - template.length) % FOLLOW_UP_POOL.length];
                }

                // Alternate sender: requester (learner) on even, provider (teacher) on odd
                User sender;
                if (isScenarioF && i >= chatLength - 3) {
                    // For Scenario F unread messages, sender must be Neha Singh (not Rahul Patil)
                    sender = learner.getName().equalsIgnoreCase("Rahul Patil") ? teacher : learner;
                } else {
                    sender = (i % 2 == 0) ? learner : teacher;
                }

                // Message status: READ for past/completed, DELIVERED/SENT for future
                MessageStatus status = MessageStatus.READ;
                if (session.getStatus() == SessionStatus.COMPLETED) {
                    status = MessageStatus.READ;
                } else {
                    if (isScenarioF && i >= chatLength - 3) {
                        status = MessageStatus.DELIVERED;
                    } else {
                        status = MessageStatus.READ; // read for older messages in accepted sessions
                    }
                }

                Message message = Message.builder()
                        .conversation(conversation)
                        .sender(sender)
                        .session(session)
                        .content(content)
                        .type(MessageType.TEXT)
                        .status(status)
                        .clientMessageId(UUID.randomUUID().toString())
                        .createdAt(msgTime)
                        .updatedAt(msgTime)
                        .deleted(false)
                        .edited(false)
                        .build();

                lastMessage = messageRepository.save(message);
                
                // Increment timestamp sequentially
                if (isScenarioB) {
                    msgTime = msgTime.plusMinutes(3);
                } else {
                    msgTime = msgTime.plusMinutes(random.nextInt(35) + 5);
                }
            }

            // Update conversation with latest message metadata
            if (lastMessage != null) {
                conversation.setLatestMessage(lastMessage);
                conversation.setUpdatedAt(lastMessage.getCreatedAt());
                conversationRepository.save(conversation);
            }

            if (isScenarioF) {
                // Find Rahul Patil participant and set unreadCount to 3
                final Long rahulId = learner.getName().equalsIgnoreCase("Rahul Patil") 
                        ? learner.getId() 
                        : teacher.getId();
                
                ConversationParticipant participant = conversationParticipantRepository
                        .findByConversationIdAndUserIdAndDeletedFalse(conversation.getId(), rahulId)
                        .orElse(null);
                
                if (participant != null) {
                    participant.setUnreadCount(3);
                    conversationParticipantRepository.save(participant);
                }
            }
        }

        log.info("Successfully seeded chat history.");
    }
}
