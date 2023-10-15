import QRCode from "easyqrcodejs";
import { Children, useEffect, useRef, useState } from "react";

export const MainQR = () => {
   const QRcodeGenerate = useRef<HTMLDivElement>(null);
   const QRbox = useRef<HTMLCanvasElement>(null);

   const [QRImageLink, setQRImageLink] = useState("");

   useEffect(() => {
      var options = {
         text: `https://qrblock.io/`,
         colorLight: "#ff4f2f",
         colorDark: "#fff",
      };
      new QRCode(QRcodeGenerate.current, options);
   }, []);

   return (
      <>
         <div id="??" ref={QRcodeGenerate}></div>
      </>
   );
};
