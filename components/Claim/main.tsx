import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getBalance, getNFTsFromInputWallet, getWalletData } from "@/components/SolanaUtils/get";
import { ChangePassword, resolveSNS, transferNFTANDSOL, transferNFTANDSOLWithKeypair } from "../SolanaUtils/contract";
import st from "@/styles/Home.module.css";
import stArrow from "@/styles/Arrow.module.css";
import stInputBox from "./style/InputBox.module.css";
import { Archivo } from "next/font/google";
import Image from "next/image";
import * as bs58 from "bs58";
import stload from "@/styles/Loading.module.css";
import { Keypair, PublicKey } from "@solana/web3.js";
import CryptoJS from "crypto-js";
import Link from "next/link";

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

const ClaimMain = () => {
   const router = useRouter();

   const [isCall, setIsCall] = useState(false);
   const [BlockWallet, setBlockWallet] = useState<BlockWalletData>();
   const [NFTs, setNFTs] = useState<any>([]);
   const [MintAddresses, setMintAddresses] = useState<any>([]);
   const [isLoaded, setIsLoaded] = useState(true);
   const [SOLAmount, setSOLAmount] = useState("0");
   const [passwordPopup, setPasswordPopup] = useState(false);
   const [CurrentPassword, setCurrentPassword] = useState("");
   const [NextPassword, setNextPassword] = useState("");
   const [NextPasswordCheck, setNextPasswordCheck] = useState("");
   const [Amount, setAmount] = useState(0.01);

   const [transferPopup, setTransferPopup] = useState(false);
   const [isTransferStart, setIsTransferStart] = useState(false);
   const [txLoading, setTxLoading] = useState(false);
   const [toPubkey, setToPubkey] = useState("");
   const [transferText, setTransferText] = useState("");

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

   const getData = async () => {
      const path = router.asPath;
      if (path.includes("[id]")) return;
      if (isCall) return;
      setIsCall(true);
      const pubkey = path.split("/")[2];
      const Balance = await getBalance(pubkey);
      const WalletData = await getWalletData(pubkey);
      setSOLAmount(Balance);
      setBlockWallet(WalletData);
      if (!WalletData) setSOLAmount("WALLET BLOCK NOT EXIST");

      const TempArr = await getNFTsFromInputWallet(pubkey);
      if (!TempArr) return;
      setNFTs(TempArr);
   };

   const callPasswordPopup = () => {
      setPasswordPopup(true);
   };
   const closePasswordPopup = () => {
      setPasswordPopup(false);
   };

   const callTransferPopup = () => {
      setTransferPopup(true);
   };

   const closeTransferPopup = () => {
      setTransferPopup(false);
      setIsTransferStart(false);
   };

   const callTransferTx = () => {
      setTransferText(`SEND YOUR ASSESTS TO ${toPubkey}`);
      setIsTransferStart(true);
      setTxLoading(false);
   };

   const inputAmount = (event: any) => {
      if (event.target.value < 0.01) setAmount(0.01);
      setAmount(event.target.value);
   };

   const SendAssests = async () => {
      try {
         if (!BlockWallet) {
            alert("Please Wait...");
            return;
         }
         setTxLoading(true);

         let currentCiphertext = "";
         for (let i = 0; i < BlockWallet.attributes.length; i++) {
            if (BlockWallet.attributes[i].trait_type === "Wallet") currentCiphertext = BlockWallet.attributes[i].value;
         }

         const bytes = CryptoJS.AES.decrypt(currentCiphertext, CurrentPassword);
         const decrypted = bytes.toString(CryptoJS.enc.Utf8);
         console.log(decrypted);
         const keypair = Keypair.fromSecretKey(bs58.decode(decrypted));
         console.log(keypair.publicKey.toString());
         let PubkeyAddress = toPubkey;
         if (toPubkey.includes(".sol")) PubkeyAddress = await resolveSNS(toPubkey);
         setTransferText("Transaction Started");

         const Success = await transferNFTANDSOLWithKeypair(keypair, Amount, MintAddresses, new PublicKey(PubkeyAddress));
         if (!Success) {
            alert("Try again...");
            return;
         }

         setTransferText("SUCCESS");
         getData();
         setTimeout(() => {
            closeTransferPopup();
         }, 2000);
      } catch (error: any) {
         console.log(error);
         closeTransferPopup();
         alert("Password might be wrong");
         return;
      }
   };

   const callChangePassword = async () => {
      if (!BlockWallet) return;
      if (NextPassword !== NextPasswordCheck) alert("Password not match.Check again");
      const Password = await ChangePassword(BlockWallet.BlockWalletPubkey, CurrentPassword, NextPassword);
      alert(Password);
   };

   useEffect(() => {
      getData();
   }, [router]);

   return (
      <>
         <>
            <div className={stInputBox.main}>
               <div className={stInputBox.titleBox}>
                  <Link href="/" className={`${fontArchivoBoldItalic.className} ${stInputBox.title}`}>
                     QRBlock
                  </Link>
               </div>

               <div className={stInputBox.LineBox}>
                  <span className={`${fontArchivoBoldItalic.className}`}>PUBKEY</span>
               </div>

               <div className={stInputBox.solInputBox}>
                  <div className={`${stInputBox.NFTTitleBox} ${fontArchivoBoldItalic.className} `}>
                     <span>{BlockWallet?.BlockWalletPubkey}</span>
                  </div>
               </div>

               <div className={stInputBox.LineBox}>
                  <span className={`${fontArchivoBoldItalic.className}`}>ASSET</span>
               </div>

               <div className={stInputBox.solInputBox}>
                  <div className={`${stInputBox.NFTTitleBox} ${fontArchivoBoldItalic.className} `}>{isLoaded ? <span>{`${SOLAmount} SOL`}</span> : <span>loading</span>}</div>
               </div>

               <div className={stInputBox.solInputBox}>
                  <div></div>
                  <input
                     onChange={inputAmount}
                     className={`${stInputBox.solInput} ${fontArchivoBoldItalic.className} `}
                     placeholder="Input amount want to transfer"
                     type="number"
                  ></input>
               </div>

               <div className={stInputBox.LineBox}>
                  <span className={`${fontArchivoBoldItalic.className}`}>NFT</span>
               </div>

               <div className={stInputBox.solInputBox}>
                  <div className={`${stInputBox.NFTTitleBox} ${fontArchivoBoldItalic.className} `}>
                     <span>Select NFT</span>
                  </div>
               </div>

               <div>
                  <span>NFT</span>
                  {NFTs.length > 0 ? (
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
                  ) : (
                     <div className={stInputBox.NFTBox}>
                        <span className={fontArchivoSemiBold.className}>NO NFT</span>
                     </div>
                  )}
               </div>

               <div className={stInputBox.BtnBox}>
                  <button className={`${fontArchivoBoldItalic.className} ${stInputBox.Btn}`} onClick={callTransferPopup}>
                     Transfer
                  </button>
                  <button className={`${fontArchivoBoldItalic.className} ${stInputBox.Btn}`} onClick={callPasswordPopup}>
                     Change Password
                  </button>
               </div>
            </div>
         </>

         {transferPopup && (
            <div className={stInputBox.PopupBack}>
               {isTransferStart ? (
                  <div className={stInputBox.PopupContentText}>
                     <span className={`${fontArchivoBoldItalic.className}`}>TRANSFER</span>
                     <div className={stInputBox.PopupText}>
                        <span className={`${fontArchivoBoldItalic.className}`}>{transferText}</span>
                     </div>
                     {txLoading ? (
                        <div className={stload.basic}></div>
                     ) : (
                        <button className={`${stInputBox.PasswordBtn} ${fontArchivoBoldItalic.className}`} onClick={SendAssests}>
                           AGREE
                        </button>
                     )}
                     <button className={stInputBox.PasswordCloseBtn} onClick={closeTransferPopup}>
                        X
                     </button>
                  </div>
               ) : (
                  <div className={stInputBox.PopupContent}>
                     <span className={`${fontArchivoBoldItalic.className}`}>TRANSFER</span>
                     <input
                        className={`${stInputBox.PasswordInput} ${fontArchivoBoldItalic.className}`}
                        placeholder="PASSWORD"
                        onChange={(event: any) => setCurrentPassword(event.target.value)}
                     ></input>
                     <input
                        className={`${stInputBox.PasswordInput} ${fontArchivoBoldItalic.className}`}
                        placeholder="Solana Publickey"
                        onChange={(event: any) => setToPubkey(event.target.value)}
                     ></input>
                     <button className={`${stInputBox.PasswordBtn} ${fontArchivoBoldItalic.className}`} onClick={callTransferTx}>
                        Transfer
                     </button>
                     <button className={stInputBox.PasswordCloseBtn} onClick={closeTransferPopup}>
                        X
                     </button>
                  </div>
               )}
            </div>
         )}

         {passwordPopup && (
            <div className={stInputBox.PopupBack}>
               <div className={stInputBox.ChangePasswordPopupContent}>
                  <span className={`${fontArchivoBoldItalic.className}`}>Change Password</span>
                  <input
                     placeholder="Current Password"
                     className={`${stInputBox.PasswordInput} ${fontArchivoBoldItalic.className}`}
                     onChange={(event: any) => setCurrentPassword(event.target.value)}
                  ></input>
                  <input
                     placeholder="Change Password"
                     className={`${stInputBox.PasswordInput} ${fontArchivoBoldItalic.className}`}
                     onChange={(event: any) => setNextPassword(event.target.value)}
                  ></input>
                  <input
                     placeholder="Change Password Check"
                     className={`${stInputBox.PasswordInput} ${fontArchivoBoldItalic.className}`}
                     onChange={(event: any) => setNextPasswordCheck(event.target.value)}
                  ></input>
                  <button className={`${stInputBox.PasswordBtn} ${fontArchivoBoldItalic.className}`} onClick={callChangePassword}>
                     Change Password
                  </button>
                  <button className={stInputBox.PasswordCloseBtn} onClick={closePasswordPopup}>
                     X
                  </button>
               </div>
            </div>
         )}
      </>
   );
};

export default ClaimMain;

type BlockWalletData = {
   name: string;
   description: string;
   seller_fee_basis_points: 1000;
   image: string;
   external_url: string;
   attributes: Array<{ trait_type: string; value: string }>;
   properties: { creators: Array<{ address: string; share: number }> };
   collection: { name: string; family: string };
   BlockWalletPubkey: string;
   MintAddress: string;
   updateAuthorityAddress: string;
};
