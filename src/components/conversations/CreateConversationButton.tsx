import React, { useState } from "react";
import { Client } from "@twilio/conversations";

import ConversationTitleModal from "../modals/ConversationTitleModal";
import { addConversation } from "../../api";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import {
  updateCurrentConversation,
  addNotifications,
  updateParticipants,
} from "../../store/action-creators";

interface NewConvoProps {
  client?: Client;
  collapsed: boolean;
}

const CreateConversationButton: React.FC<NewConvoProps> = (
  props: NewConvoProps
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);

  return (
    <>
      <Button fullWidth variant="secondary" onClick={handleOpen}>
        <PlusIcon decorative={false} title="Add convo" />
        {!props.collapsed ? "Create New Conversation" : null}
      </Button>
      <ConversationTitleModal
        title=""
        type="new"
        isModalOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onSave={async (title: string) => {
          const convo = await addConversation(
            title,
            updateParticipants,
            props.client,
            addNotifications
          );
          setIsModalOpen(false);
          updateCurrentConversation(convo.sid);
        }}
      />
    </>
  );
};

export default CreateConversationButton;
