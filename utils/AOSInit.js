"use client";
import { useEffect } from 'react';
import AOS from "aos";

const AOSInit = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, [])

  return null
}

export default AOSInit;