import { useState } from "react";
import { Button } from "@twilio-paste/button";
import { Box } from "@twilio-paste/core";
import { ProductConversationsIcon } from "@twilio-paste/icons/esm/ProductConversationsIcon";

import { login } from "../../api";
import { InputType } from "../../types";
import ModalInputField from "../modals/ModalInputField";
import styles from "../../styles";
import TwilioLogo from "../icons/TwilioLogo";

const Login = () => {
  const [isFormDirty, setFormDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box style={styles.loginContainer}>
      <Box style={styles.loginContent}>
        <Box>
          <ProductConversationsIcon
            decorative={true}
            size="sizeIcon90"
            style={styles.logo}
            color="colorTextInverse"
          />
        </Box>
        <div style={styles.loginTitle}>Twilio Conversations</div>
        <div style={styles.subTitle}>Demo experience</div>
        <Box style={styles.loginForm}>
          <Box style={styles.userInput}>
            <ModalInputField
              label="Username"
              placeholder=""
              isFocused={true}
              error={
                isFormDirty && !username.trim()
                  ? "Enter a username to sign in."
                  : ""
              }
              input={username}
              onBlur={() => setFormDirty(true)}
              onChange={setUsername}
              id="username"
            />
          </Box>
          <Box style={styles.passwordInput}>
            <ModalInputField
              label="Password"
              placeholder=""
              error={
                isFormDirty && !password
                  ? "Enter a password to sign in."
                  : formError ?? ""
              }
              input={password}
              onChange={setPassword}
              inputType={showPassword ? InputType.Text : InputType.Password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              id="password"
            />
          </Box>
          <Box style={styles.loginButton}>
            <Button
              fullWidth
              disabled={!username || !password}
              variant="primary"
              onClick={async () => {
                try {
                  await login(username, password);
                } catch (e: any) {
                  setFormError(e.message);
                }
              }}
              id="login"
            >
              Sign in
            </Button>
          </Box>
        </Box>
        <Box style={{ paddingTop: 40 }}>
          <TwilioLogo />
        </Box>
      </Box>
      <Box style={styles.loginBackground}>
        <Box
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#06033a",
            transform: "skewY(-12deg)",
            transformOrigin: "top right",
          }}
        />
      </Box>
    </Box>
  );
};

export default Login;
