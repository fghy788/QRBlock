import { useEffect, useState } from "react";
import { getNFTs } from "../SolanaUtils/get";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { SolanaMint, UploadMetadata, sendSOL, transferNFTANDSOL } from "../SolanaUtils/contract";
import * as bs58 from "bs58";
import CryptoJS from "crypto-js";
import { QRCodegenerater } from "../getQR";
import { PublicKey } from "@metaplex-foundation/js";
import Link from "next/link";
import { Archivo } from "next/font/google";
import st from "@/styles/Home.module.css";
import stArrow from "@/styles/Arrow.module.css";
import stInputBox from "./style/InputBox.module.css";
import Image from "next/image";
import stLoad from "@/styles/Loading.module.css";

const fontArchivoBoldItalic = Archivo({
   weight: "700",
   subsets: ["latin"],
   style: "italic",
});

const fontArchivoSemiBold = Archivo({
   weight: "600",
   subsets: ["latin"],
});

const fontArchivoRegular = Archivo({
   weight: "400",
   subsets: ["latin"],
});

export const GiftSolanaInputBox = () => {
   const [isCall, setIsCall] = useState(false);
   const [NFTs, setNFTs] = useState<any>([]);
   const [MintAddresses, setMintAddresses] = useState<any>([]);
   const [password, setPassword] = useState("");
   const [passwordCheck, setPasswordCheck] = useState("");
   const [isPassword, setIsPassword] = useState(false);
   const [isQR, setIsQR] = useState(false);
   const [Amount, setAmount] = useState(0.01);
   const [QRPubkey, setQRPubkey] = useState("");
   const [isTxStart, setIsTxStart] = useState(false);
   const [TxText, setTxText] = useState("Tx start");
   const [TxProcess, setTxProcess] = useState("1/4");

   const Wallet = useWallet();

   const getNFT = async () => {
      const TempArr = await getNFTs(Wallet);
      if (!TempArr) return;
      setNFTs(TempArr);
   };

   const callPassword = () => {
      setIsPassword(true);
   };

   const callQR = () => {
      setIsQR(true);
   };

   const closePassword = () => {
      setIsPassword(false);
      setPassword("");
      setPasswordCheck("");
   };

   const inputPassword = (event: any) => {
      setPassword(event.target.value);
   };
   const inputPasswordCheck = (event: any) => {
      setPasswordCheck(event.target.value);
   };
   const inputAmount = (event: any) => {
      if (event.target.value < 0.01) setAmount(0.01);
      setAmount(event.target.value);
   };
   const NFTClicked = (event: any) => {
      const MintAdd = event.target.title;
      if (!MintAdd) return;
      const TempArr = MintAddresses;
      const Index = TempArr.indexOf(MintAdd);

      if (Index === -1) {
         TempArr.push(MintAdd);
         const DOM1 = document.getElementById(`${MintAdd}`);
         if (DOM1 !== null) {
            DOM1.style.border = "5px solid #ff4f2f";
            DOM1.style.borderRadius = "5px";
         }
      } else {
         TempArr.splice(Index, 1);
         const DOM1 = document.getElementById(`${MintAdd}`);
         if (DOM1 !== null) {
            DOM1.style.border = "5px solid white";
            DOM1.style.borderRadius = "5px";
         }
      }

      setMintAddresses(TempArr);
   };

   const GenerateQR = async () => {
      if (password === "") {
         alert("Input Password");
         return;
      }
      if (password !== passwordCheck) {
         alert("Password doesn't match!");
         return;
      }
      setIsTxStart(true);
      const keypair = Keypair.generate();
      const keypairSave = bs58.encode(keypair.secretKey);
      //encrypt
      const ciphertext = await CryptoJS.AES.encrypt(keypairSave, password).toString();
      const pubkey = keypair.publicKey;
      setQRPubkey(pubkey.toString());
      const walletPubkey = Wallet.publicKey?.toString();
      if (!walletPubkey) {
         alert("Connect Your Wallet");
         setIsTxStart(false);
         return;
      }

      setTxText("Start Upload MetaData");

      const SuccessUpload = await UploadMetadata(walletPubkey, pubkey, ciphertext);
      if (!SuccessUpload) {
         alert("Upload Metadata Fail try again");
         setIsTxStart(false);
         return;
      }

      setTxText("Start send SOL(NFT Create Fee)");
      setTxProcess("2/4");

      const SendSuccess = await sendSOL(Wallet, new PublicKey("wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX"), 0.03);
      if (!SendSuccess) {
         alert("Something Wrong");
         setIsTxStart(false);
         return;
      }

      setTxText("Start Create QRBlock NFT");
      setTxProcess("3/4");

      const CreateQR = await SolanaMint(walletPubkey, pubkey, SuccessUpload);
      if (!CreateQR) {
         alert("Something Wrong");
         setIsTxStart(false);
         return;
      }

      setTxText("Start Send your Asset to QRBlock Wallet.");
      setTxProcess("4/4");

      const Success = await transferNFTANDSOL(Wallet, Amount, MintAddresses, pubkey);

      if (!Success) {
         setIsTxStart(false);
         return;
      }
      setTxText("Successfully send your asset to QRBlock");
      setIsPassword(false);
      setIsTxStart(false);
      setTxText("Started");
      setTxProcess("1/4");

      callQR();
   };

   useEffect(() => {
      if (!Wallet.publicKey) return;
      if (isCall) return;
      setIsCall(true);
      getNFT();
   }, [Wallet]);

   return (
      <>
         <>
            <div className={st.titleBox}>
               <div className={st.Link}>
                  <h1 className={`${fontArchivoSemiBold.className} ${st.title}`}>CREATE QRBlock</h1>
                  <div className={st.titletTextBox}>
                     <div className={st.titletTextBox2}>
                        <span className={`${fontArchivoRegular.className} ${st.text}`}>Crypto gift to your friend,family</span>
                        <span className={`${fontArchivoRegular.className} ${st.text}`}>DAO with simple QRCode</span>
                     </div>
                     <div className={stArrow.ArrowBox}>
                        <div className={stArrow.longArrowRight}></div>
                     </div>
                  </div>
               </div>
            </div>

            <div className={st.LineBox}>
               <div className={st.Line}></div>
            </div>

            <div className={stInputBox.solInputBox}>
               <div className={stInputBox.solLOGO}>
                  <Image src="/sol.svg" width={30} height={30} alt="SOL" />
               </div>
               <input onChange={inputAmount} className={`${stInputBox.solInput} ${fontArchivoBoldItalic.className} `} placeholder="999 SOL" type="number"></input>
            </div>

            <div className={st.LineBox}>
               <div className={st.Line}></div>
            </div>

            <div className={stInputBox.solInputBox}>
               <div className={stInputBox.NFTLOGO}>NFT</div>
               <div className={`${stInputBox.NFTTitleBox} ${fontArchivoBoldItalic.className} `}>
                  <span>Select NFT</span>
               </div>
            </div>
            {NFTs.length === 0 ? (
               <div className={stInputBox.NFTBox}>
                  <span className={fontArchivoSemiBold.className}>NEED WALLET CONNECT</span>
               </div>
            ) : (
               <div className={stInputBox.NFTBox}>
                  {NFTs.map((item: any, index: any) => {
                     const getMetadata = async () => {
                        try {
                           if (item.Success) return;
                           item.Success = true;
                           const options = {
                              method: "POST",
                              headers: { accept: "application/json" },
                              body: JSON.stringify({
                                 uri: item.uri,
                              }),
                           };

                           const ref = await fetch("/api/getNFTJSON", options);
                           const data = (await ref.json()).data;

                           const DOM1 = document.getElementById(`${item.mintAddress.toString()}image`);
                           if (!DOM1) return;
                           DOM1.style.height = "100px";
                           const bgImage = document.createElement("img");
                           bgImage.src = `${data.image}`;
                           bgImage.width = 100;
                           bgImage.height = 100;
                           bgImage.id = item.mintAddress.toString();

                           const DOM2 = document.getElementById(`${item.mintAddress.toString()}title`);

                           let title = item.name;
                           if (title.length > 13) title = title.slice(0, 10) + "...";
                           const Title = document.createTextNode(`${title}`);
                           DOM1?.appendChild(bgImage);
                           DOM2?.appendChild(Title);
                        } catch {
                           const DOM1 = document.getElementById(`${item.mintAddress.toString()}image`);
                           if (!DOM1) return;
                           DOM1.style.height = "100px";
                           const bgImage = document.createElement("img");
                           bgImage.src = `/favicon.svg`;
                           bgImage.width = 100;
                           bgImage.height = 100;
                           bgImage.id = item.mintAddress.toString();

                           const DOM2 = document.getElementById(`${item.mintAddress.toString()}title`);
                           let title = item.name;
                           if (title.length > 13) title = title.slice(0, 10) + "...";
                           const Title = document.createTextNode(`${title}`);
                           DOM1?.appendChild(bgImage);
                           DOM2?.appendChild(Title);
                        }
                     };

                     getMetadata();

                     return (
                        <div key={index} id={item.mintAddress.toString()} className={`${stInputBox.NFT} ${fontArchivoSemiBold.className}`}>
                           <div id={`${item.mintAddress.toString()}image`}></div>
                           <div id={`${item.mintAddress.toString()}title`}></div>
                           <button title={`${item.mintAddress.toString()}`} className={`${stInputBox.NFTBtn} ${fontArchivoSemiBold.className}`} onClick={NFTClicked}>
                              SELECT
                           </button>
                        </div>
                     );
                  })}
               </div>
            )}
            <div className={`${stInputBox.InputBtnBox} ${fontArchivoBoldItalic.className} `}>
               <button onClick={callPassword} className={`${stInputBox.GenerateBtn} ${fontArchivoBoldItalic.className} `}>
                  CREATE QRBlock
               </button>
            </div>
         </>

         {isPassword && (
            <div className={stInputBox.PopupBack}>
               <div className={stInputBox.PasswordPopup}>
                  <div className={stInputBox.PasswordQRCode}>
                     <Image priority src="/QRCodeW.png" width={150} height={150} alt="QRCode" />
                  </div>
                  {isTxStart ? (
                     <div className={stInputBox.PasswordContent}>
                        <span className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordTitle}`}>CREATE QR</span>
                        <div className={stLoad.basic}></div>
                        <span className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordText}`}>{TxText}</span>
                        <span className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordText}`}>{TxProcess}</span>
                     </div>
                  ) : (
                     <div className={stInputBox.PasswordContent}>
                        <span className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordTitle}`}>CREATE QR</span>
                        <input onChange={inputPassword} placeholder="Input Password" className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordInput}`}></input>
                        <input onChange={inputPasswordCheck} placeholder="Check Password" className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordInput}`}></input>
                        <button onClick={GenerateQR} className={`${fontArchivoBoldItalic.className} ${stInputBox.PasswordBtn}`}>
                           CREATE QRBlock
                        </button>
                     </div>
                  )}
                  <button onClick={closePassword} className={stInputBox.PasswordCloseBtn}>
                     X
                  </button>
               </div>
            </div>
         )}
         {isQR && (
            <>
               <QRCodegenerater QRPubkey={QRPubkey} setIsQR={setIsQR} width={160} height={170} />
            </>
         )}
      </>
   );
};
