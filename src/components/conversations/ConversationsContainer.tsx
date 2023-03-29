import React, { useState } from "react";
import { Client } from "@twilio/conversations";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box, Text } from "@twilio-paste/core";
import { ChevronDoubleRightIcon } from "@twilio-paste/icons/esm/ChevronDoubleRightIcon";

import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import styles from "../../styles";
import { TwilioClients } from "../AppContainer";

interface ConvosContainerProps {
  clients?: TwilioClients;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = ({
  clients,
}: ConvosContainerProps) => {
  const [listHidden, hideList] = useState(false);

  return (
    <Box
      style={
        listHidden
          ? { ...styles.convosWrapper, ...styles.collapsedList }
          : styles.convosWrapper
      }
    >
      <Box style={styles.newConvoButton}>
        {clients &&
          Object.keys(clients).map((conversationID) => {
            <>
              <Text as="span">{conversationID}</Text>
              <CreateConversationButton
                client={clients[conversationID]}
                collapsed={listHidden}
              />
            </>;
          })}
      </Box>
      <Box style={styles.convoList}>
        {!listHidden ? <ConversationsList /> : null}
      </Box>
      <Box style={styles.collapseButtonBox}>
        <Box
          paddingTop="space30"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
          }}
          onClick={() => hideList(!listHidden)}
        >
          {listHidden ? (
            <ChevronDoubleRightIcon decorative={false} title="Collapse" />
          ) : (
            <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationsContainer;
