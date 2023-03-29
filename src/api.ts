import axios, { AxiosError } from "axios";
import {
  Conversation,
  Message,
  Participant,
  Media,
  Client,
  Paginator,
} from "@twilio/conversations";

import {
  MessageStatus,
  ReduxMessage,
} from "./store/reducers/messageListReducer";
import {
  login as loginReducer,
  logout,
  updateActiveRole,
} from "./store/action-creators";
import {
  CONVERSATION_MESSAGES,
  CONVERSATION_PAGE_SIZE,
  PARTICIPANT_MESSAGES,
  UNEXPECTED_ERROR_MESSAGE,
} from "./constants";
import { NotificationsType } from "./store/reducers/notificationsReducer";
import { successNotification, unexpectedErrorNotification } from "./helpers";
import { getSdkMessageObject } from "./conversations-objects";
import { ReduxParticipant } from "./store/reducers/participantsReducer";
import { store } from "./store";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Accept: "*/*",
    "Content-Type": "application/json",
  },
});

const setApiInterceptors = () => {
  api.interceptors.request.use(async (req) => {
    const { token } = store.getState();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const { token } = store.getState();
      if (token && error?.response?.status === 403) {
        logout();
      }
      throw error;
    }
  );
};

setApiInterceptors();
type ParticipantResponse = ReturnType<typeof Conversation.prototype.add>;

export async function addConversation(
  name: string,
  updateParticipants: (participants: Participant[], sid: string) => void,
  client?: Client,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<Conversation> {
  if (name.length > 0 && client !== undefined) {
    try {
      const conversation = await client.createConversation({
        friendlyName: name,
      });
      await conversation.join();

      const participants = await getConversationParticipants(conversation);
      updateParticipants(participants, conversation.sid);

      successNotification({
        message: CONVERSATION_MESSAGES.CREATED,
        addNotifications,
      });

      return conversation;
    } catch (e) {
      unexpectedErrorNotification(addNotifications);

      return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
    }
  }
  return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
}

export async function addParticipant(
  name: string,
  proxyName: string,
  chatParticipant: boolean,
  convo?: Conversation,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<ParticipantResponse> {
  if (convo === undefined) {
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }

  if (chatParticipant && name.length > 0) {
    try {
      const result = await convo.add(name);
      successNotification({
        message: PARTICIPANT_MESSAGES.ADDED,
        addNotifications,
      });
      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  if (!chatParticipant && name.length > 0 && proxyName.length > 0) {
    try {
      const result = await convo.addNonChatParticipant(proxyName, name, {
        friendlyName: name,
      });
      successNotification({
        message: PARTICIPANT_MESSAGES.ADDED,
        addNotifications,
      });

      return result;
    } catch (e) {
      unexpectedErrorNotification(addNotifications);

      return Promise.reject(e);
    }
  }
  return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
}

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post("/user/login/token", {
      username,
      password,
    });
    const {
      Value: accessToken,
      Successful: successful,
      FailureReason: failureReason,
    } = response.data;
    if (successful) {
      await getUserStatus(accessToken);
    } else {
      throw new Error(failureReason);
    }
  } catch (e: any) {
    console.log({ e });
    const { with: status } = e?.response?.data || {};

    if (status === 401) throw e;
    throw setCustomApiError(e, "Something went wrong. Please try again.");
  }
};

export const getToken = async (entity?: string) => {
  let token;
  try {
    const { data } = await api.get(
      `/chat/token?forEntityId=${entity}&deviceType=web`
    );
    console.log("TOKEN_TWILIO", data);
    token = data;
  } catch (error) {
    console.log("twilio test failed:", { error, entity });
  }
  return token;
};

const getUserStatus = (accessToken: string) =>
  api
    .get("/user/current/status", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    .then((res) => {
      const { CurrentUserName: currentUserName, ActiveRole: activeRole } =
        res.data;
      if (res.status === 200 && currentUserName) {
        loginReducer(accessToken);
        updateActiveRole(activeRole);
      } else {
        throw httpErrorToCopy(res.status);
      }
    })
    .catch((e) => {
      const { with: status } = e?.response?.data || {};

      if (status === 401) throw e;
      throw setCustomApiError(e, "Something went wrong. Please try again.");
    });

export const getSchedule = () =>
  api.get("/activity/future").catch((e) => {
    const { with: status } = e?.response?.data || {};

    if (status === 401) throw e;
    throw setCustomApiError(e, "Something went wrong. Please try again.");
  });

function httpErrorToCopy(code: number | null) {
  if (!code) return "Something went wrong. Please try again.";
  switch (code) {
    case 404:
      return "The content you are looking for is not available.";
    case 401:
      return "The request you are trying to make can not be authenticated.";
    case 400:
      return "The request attempted is incorrect or corrupt on the client side.";
    case 500:
      return "Something has gone wrong on the web site's server.";
    case 502:
      return "Something has gone wrong on the web site's server.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const setCustomApiError = (e: AxiosError, m: string) => {
  const newError: AxiosError = { ...e };
  newError.message = m;
  return newError;
};

export async function getMessageStatus(
  message: ReduxMessage,
  channelParticipants: ReduxParticipant[]
): Promise<{
  [MessageStatus.Delivered]?: number;
  [MessageStatus.Read]?: number;
  [MessageStatus.Failed]?: number;
  [MessageStatus.Sending]?: number;
}> {
  // FIXME should be: return statuses[message.sid];
  // after this modification:
  // message.on("updated", ({ message, updateReasons }) => {
  // if reason includes "deliveryReceipt" {
  //   // paginate detailed receipts
  //   const receipts = await message.getDetailedDeliveryReceipts(); // paginated backend query every time
  // }
  // });

  const statuses = {
    [MessageStatus.Delivered]: 0,
    [MessageStatus.Read]: 0,
    [MessageStatus.Failed]: 0,
    [MessageStatus.Sending]: 0,
  };

  if (message.index === -1) {
    return Promise.resolve({
      ...statuses,
      [MessageStatus.Sending]: 1,
    });
  }

  channelParticipants.forEach((participant) => {
    if (
      participant.identity == localStorage.getItem("username") ||
      participant.type !== "chat"
    ) {
      return;
    }

    if (
      participant.lastReadMessageIndex &&
      participant.lastReadMessageIndex >= message.index
    ) {
      statuses[MessageStatus.Read] += 1;
    } else if (participant.lastReadMessageIndex !== -1) {
      // statuses[MessageStatus.Delivered] += 1; FIXME don't need Delivered status for chat particpants?
    }
  });

  if (message.aggregatedDeliveryReceipt) {
    const sdkMessage = getSdkMessageObject(message);
    const receipts = await sdkMessage.getDetailedDeliveryReceipts(); // paginated backend query every time

    receipts.forEach((receipt) => {
      if (receipt.status === "read") {
        statuses[MessageStatus.Read] += 1;
      }

      if (receipt.status === "delivered") {
        statuses[MessageStatus.Delivered] += 1;
      }

      if (receipt.status === "failed" || receipt.status === "undelivered") {
        statuses[MessageStatus.Failed] += 1;
      }

      if (receipt.status === "sent" || receipt.status === "queued") {
        statuses[MessageStatus.Sending] += 1;
      }
    });
  }

  return statuses;
}

export const getConversationParticipants = async (
  conversation: Conversation
): Promise<Participant[]> => await conversation.getParticipants();

export const removeParticipant = async (
  conversation: Conversation,
  participant: Participant,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<void> => {
  try {
    await conversation.removeParticipant(participant);
    successNotification({
      message: PARTICIPANT_MESSAGES.REMOVED,
      addNotifications,
    });
  } catch {
    unexpectedErrorNotification(addNotifications);
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }
};

export const getBlobFile = async (
  media: Media,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<Blob> => {
  try {
    const url = await getFileUrl(media);
    const response = await fetch(url);
    return response.blob();
  } catch (e) {
    unexpectedErrorNotification(addNotifications);
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }
};

export const getFileUrl = async (media: Media): Promise<string> => {
  return await media.getContentTemporaryUrl().then();
};

export const getMessages = async (
  conversation: Conversation
): Promise<Paginator<Message>> =>
  await conversation.getMessages(CONVERSATION_PAGE_SIZE);
