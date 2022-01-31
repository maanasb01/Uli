import { useEffect, useContext, useState } from "react";
import { Box, Text, Button, CheckBox } from "grommet";
import { UserContext } from "./AppContext";
import repository from "./repository";
import config from "./config";
const { getUserData, getPreferenceData, setUserData, setPreferenceData } =
  repository;

export function Debug() {
  const { user, setUser } = useContext(UserContext);
  const [isResetChecked, setIsResetChecked] = useState(false);
  const [localStorageData, setLocalStorageData] = useState(undefined);

  useEffect(async () => {
    const userData = await getUserData();
    const preferenceData = await getPreferenceData();
    setLocalStorageData({ user: userData, preference: preferenceData });
  }, []);

  async function clickReset() {
    try {
      await setUserData({});
      await setPreferenceData({});
      setUser(undefined);
    } catch (err) {
      alert("Error Resetting User", err);
    }
  }

  return (
    <Box width="medium" gap={"small"} align={"start"}>
      {config ? (
        <Box>
          <Text weight={500}>Config</Text>
          <Text>{JSON.stringify(config, null, 2)}</Text>
        </Box>
      ) : (
        <Text color={"status-critical"}>Unable to fetch data from Config</Text>
      )}
      {user ? (
        <Box gap={"medium"}>
          <Box gap={"small"} direction="column">
            <Text weight={500}>Environment : </Text>
            <Text>{config.ENVIRONMENT}</Text>
            <Text weight={500}>User ID : </Text>
            <Text>{user.id}</Text>
            <Text weight={500}>Access Token : </Text>
            <Text>{user.accessToken}</Text>
          </Box>

          {localStorageData ? (
            <Box>
              <Text weight={500}>Local Storage</Text>
              <Text>{JSON.stringify(localStorageData, null, 2)}</Text>
            </Box>
          ) : (
            <Text color={"status-critical"}>
              Unable to fetch data from Local Storage
            </Text>
          )}

          <Box
            pad={"xsmall"}
            border={{ color: "status-critical" }}
            margin={{ top: "xsmall" }}
            fill={"horizontal"}
            align="start"
          >
            <Text color={"status-critical"}>Delete Account</Text>
            <Box height={"0.8em"}></Box>
            <Box gap={"small"}>
              <CheckBox
                checked={isResetChecked}
                label="I am sure I want to Delete this account"
                onChange={(e) => setIsResetChecked(e.target.checked)}
              />
              <Button
                label={"Delete"}
                disabled={!isResetChecked}
                secondary
                onClick={clickReset}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Text>Can not find a logged in User</Text>
      )}
    </Box>
  );
}