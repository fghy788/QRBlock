import { SolanaRPCURL } from "@/components/Links";
import { Metaplex, PublicKey, keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import base58 from "bs58";

export const getBalance = async (wallet: string) => {
   const connection = new Connection(SolanaRPCURL, "confirmed");
   const Pubkey = new PublicKey(wallet);
   const Bal = (Math.floor(((await connection.getBalance(Pubkey)) / LAMPORTS_PER_SOL) * 1000) / 1000).toString();
   return Bal;
};

export const getNFTs = async (wallet: WalletContextState) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");
      const metaplex = new Metaplex(connection);
      metaplex.use(walletAdapterIdentity(wallet));
      const owner = wallet.publicKey;

      if (!owner) return;
      const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

      return allNFTs;
      // return allNFTs;
   } catch (error: any) {
      console.log(error);
      alert("WRONG");
   }
};

export const getWalletData = async (wallet: string) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");
      const metaplex = new Metaplex(connection);
      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const myKeypair = Keypair.fromSecretKey(base58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      metaplex.use(keypairIdentity(myKeypair));
      const owner = new PublicKey("wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX");

      if (!owner) return;
      const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

      let getWalletData = undefined;

      for (let i = 0; i < allNFTs.length; i++) {
         for (let j = 0; j < allNFTs[i].creators.length; j++) {
            if (allNFTs[i].creators[j].address.toString() === wallet) {
               getWalletData = allNFTs[i];
               break;
            }
         }
         if (getWalletData) break;
      }

      if (!getWalletData) throw new Error("NO DATA");

      const options = {
         method: "POST",
         headers: { accept: "application/json" },
         body: JSON.stringify({
            uri: getWalletData.uri,
         }),
      };
      const ref = await fetch("/api/getNFTJSON", options);
      const data = (await ref.json()).data;

      if (!data) throw new Error("FETCHING ERROR");

      data["BlockWalletPubkey"] = wallet;
      //@ts-ignore
      data["MintAddress"] = getWalletData.mintAddress.toString();
      data["updateAuthorityAddress"] = getWalletData.updateAuthorityAddress.toString();

      return data;
   } catch (error: any) {
      console.log(error);
      alert("WRONG");
   }
};

export const getNFTsFromInputWallet = async (wallet: string) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");
      const metaplex = new Metaplex(connection);
      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const myKeypair = Keypair.fromSecretKey(base58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      metaplex.use(keypairIdentity(myKeypair));
      const owner = new PublicKey(wallet);

      if (!owner) return;
      const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

      return allNFTs;
   } catch (error: any) {
      console.log(error);
      alert("WRONG");
   }
};

export const getMYBlockFromMainWallet = async (wallet: string) => {
   try {
      const connection = new Connection(SolanaRPCURL, "confirmed");
      const metaplex = new Metaplex(connection);
      if (!process.env.NEXT_PUBLIC_DATABASEWALLET) return false;
      const myKeypair = Keypair.fromSecretKey(base58.decode(process.env.NEXT_PUBLIC_DATABASEWALLET));
      metaplex.use(keypairIdentity(myKeypair));
      const owner = new PublicKey("wZf6wAsoLE3YSsCz5uSTXiAFHgYbCEwP7XHTs84CuJX");

      if (!owner) return;
      const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

      let pubkey = [];

      for (let i = 0; i < allNFTs.length; i++) {
         for (let j = 0; j < allNFTs[i].creators.length; j++) {
            if (allNFTs[i].creators[j].address.toString() === wallet) {
               pubkey.push(allNFTs[i].creators[1].address.toString());
            }
         }
      }

      return pubkey;
   } catch (error: any) {
      console.log(error);
      alert("WRONG");
   }
};
