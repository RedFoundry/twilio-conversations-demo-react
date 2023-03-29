import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { ToasterPush, useToaster } from "@twilio-paste/core";
import { Toaster } from "@twilio-paste/toast";

import { AppState } from "../store";
import { removeNotifications } from "../store/action-creators";

const Notifications: React.FC = () => {
  const toaster = useToaster();
  const notifications = useSelector((state: AppState) => state.notifications);

  useEffect(() => {
    if (!notifications.length) {
      return;
    }
    notifications.forEach((notification) =>
      toaster.push(notification as ToasterPush)
    );
    removeNotifications(notifications.length);
  }, [notifications]);

  return <Toaster {...toaster} />;
};

export default Notifications;
