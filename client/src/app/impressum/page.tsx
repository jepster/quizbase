'use client'

import React from 'react';
import Header from "@/app/components/fishingquiz.de/Header";
import Footer from "@/app/components/fishingquiz.de/Footer";
import CookieBanner from "@/app/components/CookieBanner";

export default function Page() {
  return (
    <>
      <Header/>
      <CookieBanner/>
      <Footer/>
    </>
  );
}