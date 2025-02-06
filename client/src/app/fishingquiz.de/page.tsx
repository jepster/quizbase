'use client';

import React from 'react';
import FishingQuizDe from "@/app/components/domain/FishingQuizDe";
import LoginForm from "@/app/components/LoginForm";
import {useSelector} from "react-redux";
import {RootState} from "@/app/store";
import Head from "next/head";

export default function Page() {
  const authToken = useSelector((state: RootState) => state.user.authToken);
  const isAuthenticated = authToken === 'authenticated';

  return (
    <>
      {!isAuthenticated ? (
        <div className="h-screen flex justify-center">
          <Head>
            <title>QuizMaster: Fun Quizzes for Your Spare Time!</title>
          </Head>
          <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
              <LoginForm/>
            </div>
          </div>
        </div>
      ) : (
        <FishingQuizDe/>
      )}
    </>
  );
}
