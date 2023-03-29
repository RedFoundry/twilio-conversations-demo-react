import { Conversation, Message, Participant } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { NotificationsType } from "../reducers/notificationsReducer";
import { ReduxMessage } from "../reducers/messageListReducer";
import { store } from "../store";

const dispatch = store.dispatch;
export const login = (token: string) =>
  dispatch({
    type: ActionType.LOGIN,
    payload: token,
  });
export const updateActiveRole = (activeRole: string) =>
  dispatch({
    type: ActionType.ACTIVE_ROLE_UPDATE,
    payload: activeRole,
  });

export const logout = () =>
  dispatch({
    type: ActionType.LOGOUT,
  });

export const upsertConversation = (convo: Conversation) =>
  dispatch({
    type: ActionType.UPSERT_CONVERSATION,
    payload: convo,
  });

export const removeConversation = (sid: string) =>
  dispatch({
    type: ActionType.REMOVE_CONVERSATION,
    payload: sid,
  });
export const updateCurrentConversation = (sid: string) =>
  dispatch({
    type: ActionType.UPDATE_CURRENT_CONVERSATION,
    payload: sid,
  });
export const setLastReadIndex = (index: number) =>
  dispatch({
    type: ActionType.CONVERSATION_LAST_READ_INDEX,
    payload: index,
  });

export const upsertMessages = (
  channelSid: string,
  messages: (Message | ReduxMessage)[]
) =>
  dispatch({
    type: ActionType.ADD_MESSAGES,
    payload: { channelSid, messages },
  });

export const pushMessages = (channelSid: string, messages: Message[]) =>
  dispatch({
    type: ActionType.PUSH_MESSAGES,
    payload: { channelSid, messages },
  });

export const removeMessages = (channelSid: string, messages: Message[]) =>
  dispatch({
    type: ActionType.REMOVE_MESSAGES,
    payload: { channelSid, messages },
  });
export const updateLoadingState = (loadingStatus: boolean) =>
  dispatch({
    type: ActionType.UPDATE_LOADING_STATE,
    payload: loadingStatus,
  });

export const updateParticipants = (participants: Participant[], sid: string) =>
  dispatch({
    type: ActionType.UPDATE_PARTICIPANTS,
    payload: { participants, sid },
  });

export const updateUnreadMessages = (channelSid: string, unreadCount: number) =>
  dispatch({
    type: ActionType.UPDATE_UNREAD_MESSAGES,
    payload: { channelSid, unreadCount },
  });

export const updateConversation = (
  channelSid: string,
  parameters: Partial<Conversation>
) =>
  dispatch({
    type: ActionType.UPDATE_CONVERSATION,
    payload: { channelSid, parameters },
  });

export const addAttachment = (
  channelSid: string,
  messageSid: string,
  mediaSid: string,
  attachment: Blob
) =>
  dispatch({
    type: ActionType.ADD_ATTACHMENT,
    payload: { channelSid, messageSid, mediaSid, attachment },
  });

export const clearAttachments = (channelSid: string, messageSid: string) =>
  dispatch({
    type: ActionType.CLEAR_ATTACHMENTS,
    payload: { channelSid, messageSid },
  });
export const startTyping = (channelSid: string, participant: string) =>
  dispatch({
    type: ActionType.TYPING_STARTED,
    payload: { channelSid, participant },
  });

export const endTyping = (channelSid: string, participant: string) =>
  dispatch({
    type: ActionType.TYPING_ENDED,
    payload: { channelSid, participant },
  });
export const addNotifications = (notifications: NotificationsType) =>
  dispatch({
    type: ActionType.ADD_NOTIFICATIONS,
    payload: notifications,
  });
export const removeNotifications = (toIndex: number) =>
  dispatch({
    type: ActionType.REMOVE_NOTIFICATIONS,
    payload: toIndex,
  });
