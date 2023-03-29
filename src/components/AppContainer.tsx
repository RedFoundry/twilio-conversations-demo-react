import { useState, useEffect, useMemo } from "react";

import { useSelector } from "react-redux";

import { Conversation, Client, ConnectionState } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";

import { AppState } from "../store";
import ConversationContainer from "./conversations/ConversationContainer";
import ConversationsContainer from "./conversations/ConversationsContainer";
import useAppAlert from "../hooks/useAppAlerts";
import Notifications from "./Notifications";
import stylesheet from "../styles";
import AppHeader from "./AppHeader";

import {
  initFcmServiceWorker,
  subscribeFcmNotifications,
} from "../firebase-support";
import { logout } from "../store/action-creators";
import { gracefullyCloseTwilio, twilioInit } from "../twilioUtils";
import { useIsAgency } from "../hooks/useIsAgency";
import { getSchedule } from "../api";
import { makeCombinedStoreName } from "../utils";
import { RelatedEntity } from "../types";

async function getSubscribedConversations(
  client: Client
): Promise<Conversation[]> {
  let subscribedConversations = await client.getSubscribedConversations();
  let conversations = subscribedConversations.items;

  while (subscribedConversations.hasNextPage) {
    subscribedConversations = await subscribedConversations.nextPage();
    conversations = [...conversations, ...subscribedConversations.items];
  }

  return conversations;
}

export type TwilioClients = { [key: string]: Client };
export type TwilioConnectionStates = { [key: string]: ConnectionState };
type TwilioInstances = { conversationID: string; conversationName: string }[];
const AppContainer: React.FC = () => {
  const isAgency = useIsAgency();
  const [connectionState, setConnectionState] =
    useState<TwilioConnectionStates>({});
  const [clients, setClients] = useState<TwilioClients>({});
  const [availableTwilioConnections, setAvailableTwilioConnections] =
    useState<TwilioInstances>([]);
  const conversations = useSelector((state: AppState) => state.convos);
  const sid = useSelector((state: AppState) => state.sid);
  const [alertsExist, AlertsView] = useAppAlert();

  useEffect(() => {
    getSchedule().then(({ data }) => {
      const { RelatedAgencies, RelatedDonorLocations } = data;

      if (isAgency && RelatedAgencies?.[0]?.ID) {
        setAvailableTwilioConnections([
          {
            conversationID: `${RelatedAgencies[0].EntityID}`,
            conversationName: makeCombinedStoreName({
              name: RelatedAgencies[0].Name,
              code: RelatedAgencies[0].Code,
            }),
          },
        ]);
      } else if (!isAgency && RelatedDonorLocations) {
        setAvailableTwilioConnections(
          RelatedDonorLocations.map((location: RelatedEntity) => ({
            conversationID: `${location.EntityID}`,
            conversationName: makeCombinedStoreName({
              name: location.Name || "No Name",
              code: location.Code,
            }),
          }))
        );
      }
    });
  }, []);

  useEffect(() => {
    setConnectionState({});
    availableTwilioConnections.forEach(({ conversationID, conversationName }) =>
      twilioInit(conversationID, conversationName, (state) =>
        setConnectionState((prevState) => ({
          ...prevState,
          [conversationID]: state,
        }))
      ).then((client) => {
        if (client) {
          setClients((prevState) => ({
            ...prevState,
            [conversationID]: client,
          }));
          subscribeFcmNotifications(client).catch(() => {
            console.error(
              "FCM initialization failed: no push notifications will be available"
            );
          });
          getSubscribedConversations(client).catch((error) => {
            console.error("getSubscribedConversations error", error);
          });
        }
      })
    );
    return () => {
      Object.keys(clients).forEach((conversationID) => {
        gracefullyCloseTwilio(clients[conversationID]);
      });
    };
  }, [availableTwilioConnections]);

  useEffect(() => {
    initFcmServiceWorker().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });
  }, []);

  const openedConversation = useMemo(
    () => conversations.find((convo) => convo.sid === sid),
    [sid, conversations]
  );

  return (
    <Box style={stylesheet.appWrapper}>
      <AlertsView />
      <Notifications />
      <Box>
        <AppHeader
          user={""}
          onSignOut={async () => {
            logout();

            // unregister service workers
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              registration.unregister();
            }
          }}
          connectionStates={connectionState}
        />
      </Box>
      <Box style={stylesheet.appContainer(alertsExist)}>
        <ConversationsContainer clients={clients} />
        <Box style={stylesheet.messagesWrapper}>
          <ConversationContainer conversation={openedConversation} />
        </Box>
      </Box>
    </Box>
  );
};

export default AppContainer;
