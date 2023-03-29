import {
  Client,
  Message,
  Participant,
  Conversation,
  ConnectionState,
} from "@twilio/conversations";
import { getConversationParticipants, getToken } from "./api";
import { showNotification } from "./firebase-support";
import { handlePromiseRejection } from "./helpers";
import { store } from "./store";
import {
  addNotifications,
  removeConversation,
  startTyping,
  updateCurrentConversation,
  updateParticipants,
  updateUnreadMessages,
  upsertConversation,
  upsertMessages,
  clearAttachments,
  endTyping,
  removeMessages,
} from "./store/action-creators";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUnreadMessagesType,
} from "./types";

function upsertMessage(
  message: Message,
  upsertMessages: AddMessagesType,
  updateUnreadMessages: SetUnreadMessagesType
) {
  //transform the message and add it to redux
  handlePromiseRejection(() => {
    if (store.getState().sid === message.conversation.sid) {
      message.conversation.advanceLastReadMessageIndex(message.index);
    }
    upsertMessages(message.conversation.sid, [message]);
    loadUnreadMessagesCount(message.conversation, updateUnreadMessages);
  }, addNotifications);
}

async function handleParticipantsUpdate(
  participant: Participant,
  updateParticipants: SetParticipantsType
) {
  const result = await getConversationParticipants(participant.conversation);
  updateParticipants(result, participant.conversation.sid);
}

async function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUnreadMessagesType
) {
  let count = 0;

  try {
    count =
      (await convo.getUnreadMessagesCount()) ??
      (await convo.getMessagesCount());
  } catch (e) {
    console.error("getUnreadMessagesCount threw an error", e);
  }

  updateUnreadMessages(convo.sid, count);
}

const updateTypingIndicator = (
  participant: Participant,
  sid: string,
  callback: (sid: string, user: string) => void,
  conversationID: string
) => {
  const {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    attributes: { friendlyName },
    identity,
  } = participant;
  if (identity === conversationID) {
    return;
  }
  callback(sid, identity || friendlyName || "");
};

export const twilioInit = async (
  conversationID: string,
  conversationName: string,
  setConnectionState: (state: ConnectionState) => void
) => {
  const token = await getToken(conversationID);
  if (!token) {
    console.log("twilio token is undefined");
    return;
  }
  const client = new Client(token);
  client.on("conversationJoined", (conversation) => {
    upsertConversation(conversation);

    conversation.on("typingStarted", (participant) => {
      handlePromiseRejection(
        () =>
          updateTypingIndicator(
            participant,
            conversation.sid,
            startTyping,
            conversationID
          ),
        addNotifications
      );
    });

    conversation.on("typingEnded", (participant) => {
      handlePromiseRejection(
        () =>
          updateTypingIndicator(
            participant,
            conversation.sid,
            endTyping,
            conversationID
          ),
        addNotifications
      );
    });

    handlePromiseRejection(async () => {
      if (conversation.status === "joined") {
        const result = await getConversationParticipants(conversation);
        updateParticipants(result, conversation.sid);

        const messages = await conversation.getMessages();
        upsertMessages(conversation.sid, messages.items);
        loadUnreadMessagesCount(conversation, updateUnreadMessages);
      }
    }, addNotifications);
  });

  client.on("conversationRemoved", (conversation: Conversation) => {
    updateCurrentConversation("");
    handlePromiseRejection(() => {
      removeConversation(conversation.sid);
      updateParticipants([], conversation.sid);
    }, addNotifications);
  });
  client.on("messageAdded", (message: Message) => {
    upsertMessage(message, upsertMessages, updateUnreadMessages);
    message.getParticipant().then((participant) => {
      if (participant.identity === conversationID) {
        clearAttachments(message.conversation.sid, "-1");
      }
    });
  });
  client.on("participantLeft", (participant) => {
    handlePromiseRejection(
      () => handleParticipantsUpdate(participant, updateParticipants),
      addNotifications
    );
  });
  client.on("participantUpdated", (event) => {
    handlePromiseRejection(
      () => handleParticipantsUpdate(event.participant, updateParticipants),
      addNotifications
    );
  });
  client.on("participantJoined", (participant) => {
    handlePromiseRejection(
      () => handleParticipantsUpdate(participant, updateParticipants),
      addNotifications
    );
  });
  client.on("conversationUpdated", ({ conversation }) => {
    handlePromiseRejection(
      () => upsertConversation(conversation),
      addNotifications
    );
  });

  client.on("messageUpdated", ({ message }) => {
    handlePromiseRejection(
      () => upsertMessage(message, upsertMessages, updateUnreadMessages),
      addNotifications
    );
  });

  client.on("messageRemoved", (message) => {
    handlePromiseRejection(
      () => removeMessages(message.conversation.sid, [message]),
      addNotifications
    );
  });

  client.on("pushNotification", (event) => {
    if (event.type != "twilio.conversations.new_message") {
      return;
    }

    if (Notification.permission === "granted") {
      showNotification(event);
    } else {
      console.log("Push notification is skipped", Notification.permission);
    }
  });

  client.on("tokenAboutToExpire", async () => {
    const token = await getToken(conversationID);
    if (!token) {
      console.log("twilio token is undefined");
      return;
    }
    client.updateToken(token);
  });

  client.on("tokenExpired", async () => {
    const token = await getToken(conversationID);
    if (!token) {
      console.log("twilio token is undefined");
      return;
    }
    client.updateToken(token);
  });

  client.on("connectionStateChanged", async (state) => {
    setConnectionState(state);

    if (state === "connected") {
      await client.user.updateFriendlyName(conversationName);
    }
  });

  return client;
};

export const gracefullyCloseTwilio = async (client?: Client) => {
  try {
    await client?.shutdown();
  } catch (error) {
    console.log("error while shutting down twilio:", error);
  }
};
