import { SolanaRPCURL } from "@/components/Links";
import { TokenStandard, createV1, fetchMetadataFromSeeds, mintV1, mplTokenMetadata, updateV1 } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as bs58 from "bs58";
import CryptoJS from "crypto-js";
import { getWalletData } from "./get";
import { getHashedNameSync, getNameAccountKeySync, NameRegistryState } from "@bonfida/spl-name-service";

export const sendSOL = async (wallet: WalletContextState, toPubkey: PublicKey, lamports: number) => {
   try {
      if (!wallet.publicKey) return false;
      const connection = new Connection(SolanaRPCURL, "confirmed");

      const transferTransaction = new Transaction().add(
         SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey,
            lamports: lamports * LAMPORTS_PER_SOL,
         })
      );

      await wallet.sendTransaction(transferTransaction, connection);

      return true;
   } catch (error: any) {
      const errorMessage = error.toString();
      if (errorMessage.includes("User rejected the request")) alert("USER DENIED");
      else alert("SOMETHING WORNG");
      return false;
   }
};

export const transferNFTANDSOL = async (wallet: WalletContextState, Amount: number, MintAddresses: Array<string>, toPubkey: PublicKey) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");

      const transaction = new Transaction();
      if (!wallet.publicKey) return false;
      //트렉젝션 생성

      transaction.add(
         SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey,
            lamports: Amount * LAMPORTS_PER_SOL,
         })
      );

      for (let i = 0; i < MintAddresses.length; i++) {
         const mintAddress = new PublicKey(MintAddresses[i]);

         const associatedTokenFrom = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);
         const fromAccount = await getAccount(connection, associatedTokenFrom);
         //전송지갑주소 & 토큰주소

         const associatedTokenTo = await getAssociatedTokenAddress(mintAddress, toPubkey);
         //수신지갑주소 & 토큰주소

         if (!(await connection.getAccountInfo(associatedTokenTo))) {
            transaction.add(createAssociatedTokenAccountInstruction(wallet.publicKey, associatedTokenTo, toPubkey, mintAddress));
         }
         //토큰어카운트 불러오기 실패시 생성하기
         transaction.add(
            createTransferInstruction(
               fromAccount.address, // source
               associatedTokenTo, // dest
               wallet.publicKey,
               1
            )
         );
      }

      transaction.recentBlockhash = await (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = wallet.publicKey;

      //nft 전송 트렌젝션 추가

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      return true;
   } catch (error: any) {
      console.log(error);
      const errorMessage = error.toString();
      if (errorMessage.includes("User rejected the request")) alert("USER DENIED");
      else alert("SOMETHING WORNG");

      return false;
   }
};

export const transferNFTANDSOLWithKeypair = async (keypair: Keypair, Amount: number, MintAddresses: Array<string>, toPubkey: PublicKey) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");

      const transaction = new Transaction();
      //트렉젝션 생성

      transaction.add(
         SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey,
            lamports: Amount * LAMPORTS_PER_SOL,
         })
      );

      console.log("??");

      for (let i = 0; i < MintAddresses.length; i++) {
         const mintAddress = new PublicKey(MintAddresses[i]);

         const associatedTokenFrom = await getAssociatedTokenAddress(mintAddress, keypair.publicKey);
         const fromAccount = await getAccount(connection, associatedTokenFrom);
         //전송지갑주소 & 토큰주소

         const associatedTokenTo = await getAssociatedTokenAddress(mintAddress, toPubkey);
         //수신지갑주소 & 토큰주소

         if (!(await connection.getAccountInfo(associatedTokenTo))) {
            transaction.add(createAssociatedTokenAccountInstruction(keypair.publicKey, associatedTokenTo, toPubkey, mintAddress));
         }
         //토큰어카운트 불러오기 실패시 생성하기
         transaction.add(
            createTransferInstruction(
               fromAccount.address, // source
               associatedTokenTo, // dest
               keypair.publicKey,
               1
            )
         );
      }
      console.log("??");
      transaction.recentBlockhash = await (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = keypair.publicKey;

      //nft 전송 트렌젝션 추가
      console.log("??");
      await sendAndConfirmTransaction(connection, transaction, [keypair]);

      return true;
   } catch (error: any) {
      console.log(error);
      const errorMessage = error.toString();
      if (errorMessage.includes("User rejected the request")) alert("USER DENIED");
      else alert("SOMETHING WORNG");

      return false;
   }
};

export const UploadMetadata = async (CreateWalletPubkey: string, BlockPubkey: PublicKey, BlockWalletKey: string) => {
   try {
      const name = BlockPubkey.toString();
      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const umi = createUmi(SolanaRPCURL);
      const myKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      umi.use(keypairIdentity(myKeypair)).use(
         bundlrUploader({
            address: "https://node1.irys.xyz",
            providerUrl: SolanaRPCURL,
         })
      );
      umi.use(mplTokenMetadata());

      const metadata = {
         name: "QR Wallet Block",
         description: `QRBlock's User Wallet DataBlock. ${name}`,
         seller_fee_basis_points: 1000,
         image: "https://arweave.net/z8d1n9Qfw1lvJRdQ25yeNf_uE0wOFcBs4w26xxw5CaU",
         external_url: "https://qrblock.io",
         attributes: [
            {
               trait_type: "Wallet",
               value: BlockWalletKey,
            },
            {
               trait_type: "Chain",
               value: "SOLANA",
            },
            {
               trait_type: "Pubkey",
               value: name,
            },
         ],
         properties: {
            creators: [
               {
                  address: "wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX",
                  share: 34,
               },
               {
                  address: name,
                  share: 33,
               },
               {
                  address: CreateWalletPubkey,
                  share: 33,
               },
            ],
         },
         collection: {
            name: "QRBlock",
            family: "QRBlock",
         },
      };

      const Uri = await umi.uploader.uploadJson(metadata);
      return Uri;
   } catch {
      return undefined;
   }
};

export const SolanaMint = async (walletPubkey: string, Pubkey: PublicKey, uri: string) => {
   //메타플렉스 설정
   try {
      const name = Pubkey.toString();
      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const umi = createUmi(SolanaRPCURL);
      const myKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      umi.use(keypairIdentity(myKeypair));
      umi.use(mplTokenMetadata());

      const mint = generateSigner(umi);

      await createV1(umi, {
         mint,
         name: "QRBlock",
         uri,
         sellerFeeBasisPoints: percentAmount(10),
         tokenStandard: TokenStandard.NonFungible,
         creators: [
            {
               address: publicKey("wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX"),
               share: 34,
               verified: false,
            },
            {
               address: publicKey(name),
               share: 33,
               verified: false,
            },
            {
               address: publicKey(walletPubkey),
               share: 33,
               verified: false,
            },
         ],
      })
         .add(
            await mintV1(umi, {
               mint: mint.publicKey,
               amount: 1,
               tokenOwner: publicKey("wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX"),
               tokenStandard: TokenStandard.NonFungible,
            })
         )
         .sendAndConfirm(umi);
      return true;
   } catch (error: any) {
      return false;
   }
};

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

export const ChangePassword = async (pubkey: string, currentPassword: string, changePassword: string) => {
   try {
      console.log("Start");
      const data: BlockWalletData = await getWalletData(pubkey);

      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const umi = createUmi(SolanaRPCURL);
      const myKeypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      umi.use(keypairIdentity(myKeypair));
      umi.use(mplTokenMetadata());

      let createrWallet = "";
      for (let i = 0; i < data.properties.creators.length; i++) {
         const walletAdd = data.properties.creators[i].address;
         if (walletAdd === data.updateAuthorityAddress) continue;
         if (walletAdd === data.BlockWalletPubkey) continue;
         createrWallet = walletAdd;
      }

      let currentCiphertext = "";
      for (let i = 0; i < data.attributes.length; i++) {
         if (data.attributes[i].trait_type === "Wallet") currentCiphertext = data.attributes[i].value;
      }

      const bytes = CryptoJS.AES.decrypt(currentCiphertext, currentPassword);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      const keypair = Keypair.fromSecretKey(bs58.decode(decrypted));

      const keypairSave = bs58.encode(keypair.secretKey);
      //encrypt
      const ciphertext = await CryptoJS.AES.encrypt(keypairSave, changePassword).toString();

      const uri = await UploadMetadata(createrWallet, new PublicKey(data.BlockWalletPubkey), ciphertext);
      if (!uri) throw new Error("FAIL TO UPLOAD METADATA");
      console.log("Success upload Metadata");
      const initialMetadata = await fetchMetadataFromSeeds(umi, { mint: publicKey(data.MintAddress) });
      const signer = createSignerFromKeypair(umi, myKeypair);

      await updateV1(umi, {
         mint: publicKey(data.MintAddress),
         authority: signer,
         data: { ...initialMetadata, name: "QR Wallet Block", uri },
      }).sendAndConfirm(umi);

      console.log("Success change Password");

      return "success";
   } catch (error: any) {
      const errormessage = error.toString();
      if (errormessage === "Error: bad secret key size") return "Wrong password";
      return "Something wrong";
   }
};

export const resolveSNS = async (domain: string) => {
   const hashedName = await getHashedNameSync(domain.replace(".sol", ""));
   const nameAccountKey = await getNameAccountKeySync(
      hashedName,
      undefined,
      new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
   );
   const connection = new Connection(SolanaRPCURL, "confirmed");
   const owner = await NameRegistryState.retrieve(connection, nameAccountKey);
   console.log(owner.registry.owner.toBase58());
   return owner.registry.owner.toBase58();
};
