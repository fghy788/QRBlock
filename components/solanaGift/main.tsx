import { Headers } from "../Header";
import { GiftSolanaInputBox } from "./InputBox";
import st from "@/styles/Home.module.css";

export const GiftSolanaMain = () => {
   return (
      <div className={st.main}>
         <Headers />
         <GiftSolanaInputBox />
      </div>
   );
};
