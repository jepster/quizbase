'use client'

import React from 'react';
import Header from "@/app/components/fishingquiz.de/Header";
import Footer from "@/app/components/fishingquiz.de/Footer";
import CookieBanner from "@/app/components/CookieBanner";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Header/>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <Link href="/"
                  className="inline-flex items-center text-black font-bold pb-4 rounded">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Zur Startseite
            </Link>
            <h1>Impressum</h1>
            <p>Angaben gemäß § 5 TMG</p>
            <img src="/impressum-address.png" alt="Adressinformationen"/>
            <p><strong>Haftungsausschluss: </strong><br/><br/><strong>Haftung für Inhalte</strong><br/><br/>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
              Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7
              Abs.1 TMG
              für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG
              sind wir
              als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
              überwachen
              oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
              Entfernung
              oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
              diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.<br/><br/><strong>Haftung
                für Links</strong><br/><br/>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb
              können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten
              ist stets
              der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
              Zeitpunkt der
              Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung
              nicht
              erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte
              einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links
              umgehend entfernen.<br/><br/><strong>Urheberrecht</strong><br/><br/>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
              Grenzen des
              Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und
              Kopien
              dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
              dieser
              Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden
              Inhalte
              Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
              werden, bitten
              wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
              umgehend entfernen.<br/><br/><strong>Datenschutz</strong><br/><br/>
              Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf
              unseren
              Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt
              dies,
              soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht
              an
              Dritte weitergegeben. <br/>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail)
              Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht
              möglich.
              <br/>
              Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung
              von
              nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich
              widersprochen. Die
              Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung
              von
              Werbeinformationen, etwa durch Spam-Mails, vor.<br/>
            </p>
          </div>
        </div>
      </div>
      <CookieBanner/>
      <Footer/>
    </>
  );
}