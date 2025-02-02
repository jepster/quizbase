'use client'

import React from 'react';
import { Heart, Sparkles, MessageCircle, Shield, Users, Brain } from 'lucide-react';

export default function Page() {

  function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <Icon className="w-8 h-8 text-pink-600 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-pink-600"/>
          </div>
          <h1
            className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            Lernt euch spielerisch kennen
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Entdecke Gemeinsamkeiten durch spannende Quiz-Spiele. Der perfekte Eisbrecher für neue Bekanntschaften und
            tiefere Gespräche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <input
              type="text"
              placeholder="Wählen Sie ein interessantes Thema..."
              className="px-6 py-3 rounded-full text-lg border-2 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 flex-1 max-w-md"
            />
            <button
              className="px-8 py-3 bg-pink-600 text-white rounded-full text-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl">
              Quiz erstellen
            </button>
          </div>
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600/10 to-purple-600/10 p-4 rounded-2xl border-2 border-pink-200/50 backdrop-blur-sm">
            <span
              className="px-2 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-bold rounded-lg">
              ALPHA
            </span>
            <p className="text-gray-700">
              Sei unter den Ersten, die diese innovative Art des Kennenlernens erleben!
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Warum Quiz-Dating?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Sparkles}
              title="Spielerisch Verbinden"
              description="Brechen Sie das Eis mit unterhaltsamen Quiz zu Themen, die Sie beide interessieren."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Tiefere Gespräche"
              description="Entdecken Sie gemeinsame Interessen und starten Sie bedeutungsvolle Unterhaltungen."
            />
            <FeatureCard
              icon={Shield}
              title="Sicher & Respektvoll"
              description="Unsere KI achtet auf ethische Richtlinien und respektvolle Interaktionen."
            />
            <FeatureCard
              icon={Users}
              title="Gemeinsam Lernen"
              description="Teilen Sie Wissen und Erfahrungen in einer entspannten Atmosphäre."
            />
            <FeatureCard
              icon={Brain}
              title="Clever Kennenlernen"
              description="Die KI passt die Fragen an Ihre gemeinsamen Interessen an."
            />
            <FeatureCard
              icon={Heart}
              title="Echte Verbindungen"
              description="Finden Sie Menschen, die Ihre Leidenschaft für Wissen und Entdeckung teilen."
            />
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <blockquote className="text-xl text-gray-600 italic mb-4">
                Durch die Quiz haben wir uns auf eine ganz besondere Art kennengelernt. Es war entspannt, lustig und hat uns sofort Gesprächsthemen gegeben. Jetzt sind wir seit 6 Monaten zusammen!
              </blockquote>
              <p className="font-semibold">Marie & Thomas</p>
              <p className="text-gray-500">Haben sich über Quiz-Dating gefunden</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit für bedeutungsvolle Verbindungen?</h2>
          <p className="text-xl mb-8">Starten Sie jetzt Ihr erstes Quiz-Dating-Abenteuer!</p>
          <button className="px-8 py-3 bg-white text-pink-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
            Kostenlos starten
          </button>
        </div>
      </div>
    </div>
  );
}
