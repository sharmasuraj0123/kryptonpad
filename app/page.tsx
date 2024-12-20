"use client";

import { DemexCard } from "@/components/demex-card";
import WalletConnectModal from "@/components/modal/WalletConnectModal";
import { ThreeStateToggle } from "@/components/three-state-toggle";
import CustomConnectButton from "@/components/ui/CustomConnectButton";
import { supabase } from "@/lib/supabaseClient";
import pools_token_abi from "@/contracts/pools_token_abi.json";

import { UserButton } from "@clerk/nextjs";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Abi, Address, decodeErrorResult } from "viem";
import { useAccount, useWriteContract } from "wagmi";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Live");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { isConnected } = useAccount();
  const { address } = useAccount();

  const idoData = [
    { id: 1, status: "live" },
    { id: 2, status: "upcoming" },
    { id: 3, status: "past" },
    { id: 4, status: "live" },
  ];

  const { writeContractAsync } = useWriteContract();

  const filteredIdoData = idoData.filter(
    (item) => item.status.toLowerCase() === activeTab.toLowerCase()
  );

  useEffect(() => {
    setIsModalOpen(!isConnected);
  }, [isConnected]);

  useEffect(() => {
    // Fetch the Twitter details from the API
    fetch("/api/notion")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => console.log(data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    async function fetchData() {
      let { data: users, error } = await supabase.from("users").select("*");

      if (error) {
        console.log(error.message);
      } else {
        console.log(users);
      }
    }
    fetchData();
  }, []);

  const addUserData = useCallback(async () => { 
    try {
      const { data, error } = await supabase.from("users").insert([
        {
          twitter_id: "123456789",
          twitter_username: "exampleuser",
          wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
          user_type: "KOL", // Correct enum value ('KOL' or 'Community')
        },
      ]);
      if (error) {
        console.log(error.message);
      } else {
        console.log(data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => {
    addUserData();
  }, [addUserData]);


  const handleSubmit = async () => {
    try {
      const data = await writeContractAsync({
        abi: pools_token_abi as Abi,
        address: process.env.NEXT_PUBLIC_FUND_SMART_CONTRACT_ADDRESS as Address,
        functionName: "mintTo", // Update with the correct function name
        args: [address , "10000"],
      });
      console.log(data)
    } catch (error: any) {
      try {
        const decodedError = decodeErrorResult({
          abi: pools_token_abi as Abi,
          data: error?.data,
        });
        console.log("Decoded Error:", decodedError);
      } catch (decodeError) {
        console.log("Error decoding result:", decodeError);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black">
      <Head>
        <title>KryptonPad</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative">
        <div className="flex flex-row gap-4 items-center absolute top-0 right-0 p-4">
          <CustomConnectButton />
          <button
          onClick={handleSubmit}
          className="flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
          >Fund</button>
          <UserButton />
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="text-5xl font-bold text-white mb-12 text-center">
          KryptonPad
        </h1>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">
            IDO
          </h2>
          <div className="max-w-md mx-auto">
            <ThreeStateToggle onChange={(newState) => setActiveTab(newState)} />
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdoData.map((item) => (
            <DemexCard key={item.id} status={item.status} />
          ))}
        </div>
      </main>
      <WalletConnectModal isOpen={isModalOpen} />
    </div>
  )
}
