import QRCode from "easyqrcodejs";
import { Children, useEffect, useRef } from "react";

export const QRCodegenerater = () => {
   const QRcodeGenerate = useRef<HTMLDivElement>(null);
   const QRbox = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      var options = {
         text: "https://qrblock.io",
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

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 320);

      ctx.fillStyle = "black";
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText("QRBlock.io", 110, 305);
      var image = new Image();
      image.onload = function () {
         ctx?.drawImage(image, 20, 20);
      };
      image.src = URL;
   }, []);

   return (
      <>
         <div>
            <canvas ref={QRbox} width={300} height={320} style={{ width: 300, height: 320 }}></canvas>
         </div>
         <div id="??" ref={QRcodeGenerate} style={{ display: "none" }}></div>
      </>
   );
};
