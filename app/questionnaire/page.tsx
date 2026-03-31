"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TripTailor from "../questionnaire/quest";

export default function QuestPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/Login");
    }
  }, []);



  return <TripTailor />;
}