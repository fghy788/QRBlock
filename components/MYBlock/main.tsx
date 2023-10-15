import { useWallet } from "@solana/wallet-adapter-react";
import { WalletModalButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { getMYBlockFromMainWallet } from "../SolanaUtils/get";
import { Headers } from "../Header";
import { QRCodegenerater } from "../getQR";
import Link from "next/link";
import { MYQRCodegenerater } from "../getMYQR";
import st from "@/styles/MY.module.css";
import stload from "@/styles/Loading.module.css";

const MYBlockMain = () => {
   const Wallet = useWallet();
   const [isCall, setIsCall] = useState(false);
   const [NFTs, setNFTs] = useState<any>([]);
   const [QRImage, setQRImage] = useState("");

   const callgetNFTFromMainWallet = async () => {
      if (!Wallet.publicKey) {
         alert("CONNECT WALLET");
         return;
      }

      const TempArr = await getMYBlockFromMainWallet(Wallet.publicKey?.toString());
      console.log(TempArr);
      setNFTs(TempArr);
   };

   useEffect(() => {
      if (!Wallet.publicKey) return;
      if (isCall) return;
      setIsCall(true);
      callgetNFTFromMainWallet();
   }, [Wallet]);

   return (
      <>
         <div className={st.Back}>
            <div>
               <Headers />
            </div>
            <div className={st.MYBOX}>
               {NFTs.length === 0 && (
                  <>
                     <div className={stload.basic}></div>
                     <span className={st.MYLink}>CONNECT YOUR WALLET</span>
                  </>
               )}
               {NFTs.map((item: any, index: any) => {
                  return (
                     <div key={index} className={st.MYBLOCK}>
                        <MYQRCodegenerater QRPubkey={item} width={150} height={150} />
                        <Link href={`/QRBlock/${item}`} className={st.MYLink}>
                           <span>{item.slice(0, 4) + "..." + item.slice(40, 44)}</span>
                        </Link>
                     </div>
                  );
               })}
            </div>
         </div>
      </>
   );
};

export default MYBlockMain;
