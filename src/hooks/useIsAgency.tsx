import { useSelector } from "react-redux";
import { AppState } from "../store";

export const useIsAgency = () => {
  const { activeRole } = useSelector((state: AppState) => state);
  return activeRole === "agency";
};
