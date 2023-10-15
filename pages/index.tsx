import Head from "next/head";
import Image from "next/image";
import st from "@/styles/Home.module.css";
import stArrow from "@/styles/Arrow.module.css";
import Link from "next/link";

import { Archivo } from "next/font/google";
import { useState } from "react";

const fontArchivoSemiBold = Archivo({
   weight: "600",
   subsets: ["latin"],
});

const fontArchivoRegular = Archivo({
   weight: "400",
   subsets: ["latin"],
});

export default function Home() {
   const [titleClass, setTitleClass] = useState(st.title);
   const TitleMouseEnter = () => {
      setTitleClass(st.titleOrange);
   };
   const TitleMouseOut = () => {
      setTitleClass(st.title);
   };

   return (
      <>
         <Head>
            <title>QRBlock-Demo</title>
            <meta name="description" content="Create new WEB3.0 ecosystem with QRBlock" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.svg" />
         </Head>
         <main className={st.main}>
            <div className={st.mainBox}>
               <div className={st.headerBox}>
                  <Image src="/favicon.svg" width={30} height={35} alt="LOGO" />
                  <div></div>
               </div>
               <div className={st.contentBox}>
                  <div className={st.titleBox}>
                     <Link href="/QRBlock/solana" className={st.Link} onMouseEnter={TitleMouseEnter} onMouseLeave={TitleMouseOut}>
                        <h1 className={`${fontArchivoSemiBold.className} ${titleClass}`}>CREATE QRBlock</h1>
                        <div className={st.titletTextBox}>
                           <div className={st.titletTextBox2}>
                              <span className={`${fontArchivoRegular.className} ${st.text}`}>Crypto gift to your friend,family</span>
                              <span className={`${fontArchivoRegular.className} ${st.text}`}>DAO with simple QRCode</span>
                           </div>
                           <div className={stArrow.ArrowBox}>
                              <div className={stArrow.longArrowRight}></div>
                           </div>
                        </div>
                     </Link>
                  </div>
                  <div className={st.Links}>
                     <Link href="/MYBlock" className={`${fontArchivoSemiBold.className}  ${st.Link}  ${st.OrangeBtn}`}>
                        <span>MY QRBlock</span>
                        <div className={stArrow.SmallArrowBox}>
                           <div className={stArrow.SmallLongArrowRight}></div>
                        </div>
                     </Link>

                     <Link href="/" className={st.WhiteBtn}>
                        <span className={`${fontArchivoSemiBold.className}`}>What is QRBlock?</span>
                        <div className={stArrow.SmallOrangeArrowBox}>
                           <div className={stArrow.SmallOrangeLongArrowRight}></div>
                        </div>
                     </Link>
                  </div>
               </div>
            </div>
         </main>
      </>
   );
}
