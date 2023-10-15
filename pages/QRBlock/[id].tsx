import ClaimMain from "@/components/Claim/main";
import { Headers } from "@/components/Header";
import { QRCodegenerater } from "@/components/getQR";
import Head from "next/head";
import Link from "next/link";
import st from "@/styles/Home.module.css";
import Image from "next/image";

const Index = () => {
   return (
      <>
         <Head>
            <title>QRBlock-Demo</title>
            <meta name="description" content="Create new WEB3.0 ecosystem with QRBlock" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.svg" />
         </Head>
         <main>
            <ClaimMain />
         </main>
      </>
   );
};

export default Index;
