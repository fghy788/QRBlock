import QRCode from "easyqrcodejs";
import { Children, useEffect, useRef, useState } from "react";
import st from "@/styles/QR.module.css";
import { Archivo } from "next/font/google";
import { CardSVG, CoinSVG, ETCSVG, StickerSVG } from "./SVG";

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

export const QRCodegenerater = ({ QRPubkey, setIsQR, width, height }: any) => {
   const QRcodeGenerate = useRef<HTMLDivElement>(null);
   const QRbox = useRef<HTMLCanvasElement>(null);

   const [QRImageLink, setQRImageLink] = useState("");

   const closeQR = () => {
      setIsQR(false);
   };

   useEffect(() => {
      var options = {
         text: `https://qrblock.io/QRBlock/${QRPubkey}`,
         width,
         height,
         colorLight: "#ff4f2f",
         colorDark: "#fff",
      };
      new QRCode(QRcodeGenerate.current, options);
      const QRcanvas: any = QRcodeGenerate.current?.children[0];
      if (!QRcanvas) return;
      const URL = QRcanvas.toDataURL();

      const ctx = QRbox.current?.getContext("2d");
      if (!ctx) {
         alert("Something Wrong!!");
         return;
      }

      ctx.fillStyle = "#ff4f2f";
      ctx.fillRect(0, 0, width + 40, height + 40);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText("QRBlock.io", width / 2 - 25, height + 33);

      var image = new Image();
      image.src = URL;
      image.onload = function () {
         ctx?.drawImage(image, 20, 20);
         if (!QRbox.current) return;
         setQRImageLink(QRbox.current.toDataURL());
      };
   }, []);

   return (
      <>
         <div className={st.main}>
            <div className={st.QRBox}>
               <span className={`${fontArchivoBoldItalic.className} ${st.QRTitle}`}>QRBlock</span>
               <canvas ref={QRbox} width={width + 40} height={height + 60} style={{ width: width + 40, height: height + 60 }}></canvas>
               <a download={"QRblock"} href={`${QRImageLink}`} className={`${st.QRLink} ${fontArchivoBoldItalic.className}`}>
                  SAVE QRCode
               </a>
               <button onClick={closeQR} className={st.QRCloseBtn}>
                  X
               </button>
               <div>
                  <span className={`${st.QRShopTitle} ${fontArchivoBoldItalic.className}`}>Secial Gift</span>
                  <div className={st.QRShopLink}>
                     <div
                        className={`${st.QRShopLinkText} ${fontArchivoRegular.className}`}
                        onClick={() => {
                           alert("Coming Soon");
                        }}
                     >
                        <StickerSVG />
                        <span>Sticker</span>
                     </div>

                     <div
                        className={`${st.QRShopLinkText} ${fontArchivoRegular.className}`}
                        onClick={() => {
                           alert("Coming Soon");
                        }}
                     >
                        <CardSVG />
                        <span>Card</span>
                     </div>

                     <div
                        className={`${st.QRShopLinkText} ${fontArchivoRegular.className}`}
                        onClick={() => {
                           alert("Coming Soon");
                        }}
                     >
                        <CoinSVG />
                        <span>Coin</span>
                     </div>

                     <div
                        className={`${st.QRShopLinkText} ${fontArchivoRegular.className}`}
                        onClick={() => {
                           alert("Coming Soon");
                        }}
                     >
                        <ETCSVG />
                        <span>ETC</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div id="??" ref={QRcodeGenerate} style={{ display: "none" }}></div>
      </>
   );
};
