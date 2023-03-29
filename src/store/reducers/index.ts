import { Action, combineReducers } from "redux";

import tokenReducer from "./tokenReducer";
import activeRoleReducer from "./activeRoleReducer";
import convoReducer, { ReduxConversation } from "./convoReducer";
import sidReducer from "./currentConvoReducer";
import messageReducer, { ChatMessagesState } from "./messageListReducer";
import loadingReducer from "./loadingReducer";
import participantReducer, { ParticipantsType } from "./participantsReducer";
import unreadMessagesReducer, {
  UnreadMessagesState,
} from "./unreadMessagesReducer";
import attachmentsReducer, { AttachmentsState } from "./attachmentsReducer";
import { ActionType } from "../action-types";
import typingDataReducer, { TypingDataState } from "./typingDataReducer";
import lastReadIndexReducer from "./lastReadIndexReducer";
import notificationsReducer, {
  NotificationsType,
} from "./notificationsReducer";

export type AppState = {
  token: string;
  convos: ReduxConversation[];
  sid: string;
  messages: ChatMessagesState;
  unreadMessages: UnreadMessagesState;
  loadingStatus: boolean;
  participants: ParticipantsType;
  attachments: AttachmentsState;
  typingData: TypingDataState;
  lastReadIndex: number;
  notifications: NotificationsType;
  activeRole: string;
};

export const initialState = {
  token: "",
  sid: "",
  messages: {},
  attachments: {},
  participants: {},
  convos: [],
  unreadMessages: {},
  loadingStatus: true,
  typingData: {},
  lastReadIndex: -1,
  notifications: [],
  activeRole: "",
};

const reducers = (
  state: AppState | undefined,
  action: Action
): ReturnType<typeof appReducer> => {
  if (action.type === ActionType.LOGOUT) {
    return appReducer(initialState, action);
  }

  return appReducer(state, action);
};

const appReducer = combineReducers({
  token: tokenReducer,
  convos: convoReducer,
  sid: sidReducer,
  lastReadIndex: lastReadIndexReducer,
  messages: messageReducer,
  loadingStatus: loadingReducer,
  participants: participantReducer,
  unreadMessages: unreadMessagesReducer,
  attachments: attachmentsReducer,
  typingData: typingDataReducer,
  notifications: notificationsReducer,
  activeRole: activeRoleReducer,
});

export default reducers;
