import { ProductConversationsIcon } from "@twilio-paste/icons/esm/ProductConversationsIcon";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Avatar } from "@twilio-paste/avatar";
import { Text } from "@twilio-paste/core";
import { Menu, MenuButton, useMenuState, MenuItem } from "@twilio-paste/menu";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import React, { useMemo } from "react";
import styles from "../styles";
import { TwilioConnectionStates } from "./AppContainer";

type AppHeaderProps = {
  user: string;
  onSignOut: () => void;
  connectionStates: TwilioConnectionStates;
};
const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  connectionStates,
}) => {
  const menu = useMenuState();

  const getLabel = (connectionID: string) => {
    switch (connectionStates[connectionID]) {
      case "connected":
        return "online";
      case "connecting":
        return "connecting";
      default:
        return "offline";
    }
  };

  return (
    <div style={styles.appHeader}>
      <div style={styles.flex}>
        <ProductConversationsIcon
          color="colorTextInverse"
          size="sizeIcon70"
          decorative={false}
          title="app logo"
        />
        <div style={styles.appLogoTitle}>Twilio Conversations</div>
      </div>
      <div style={styles.userTile}>
        <Avatar size="sizeIcon70" name="avatar example" icon={UserIcon} />
        <div
          style={{
            padding: "0 10px",
          }}
        >
          {user}
          {Object.keys(connectionStates).map((connectionID) => {
            const label = getLabel(connectionID);
            return (
              <Text
                key={connectionID}
                as="span"
                color={
                  label === "online"
                    ? "colorTextIconAvailable"
                    : label === "connecting"
                    ? "colorTextIconBusy"
                    : "colorTextIconError"
                }
                style={{
                  fontSize: "10px",
                  display: "block",
                  paddingTop: 5,
                  lineHeight: 0,
                }}
              >
                {label === "online"
                  ? "Online"
                  : label === "connecting"
                  ? "Connecting…"
                  : "Offline"}
              </Text>
            );
          })}
        </div>
        <MenuButton {...menu} variant="link" size="reset">
          <ChevronDownIcon
            color="colorTextInverse"
            decorative={false}
            title="Settings"
          />
        </MenuButton>
        <Menu {...menu} aria-label="Preferences">
          <MenuItem {...menu} onClick={onSignOut}>
            Sign Out
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default AppHeader;
