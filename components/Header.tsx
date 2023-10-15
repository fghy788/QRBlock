import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { useEffect, useState } from "react";
import st from "@/styles/Home.module.css";
import Link from "next/link";

export const Headers = () => {
   const [WalletLoaded, setWalletLoaded] = useState(false);

   useEffect(() => {
      setWalletLoaded(true);
   }, []);

   return (
      <div className={st.headerBox}>
         <Link href="/">
            <Image src="/favicon.svg" width={30} height={35} alt="LOGO" />
         </Link>
         <div>{WalletLoaded && <WalletMultiButton />}</div>
      </div>
   );
};
