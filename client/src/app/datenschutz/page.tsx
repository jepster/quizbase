'use client';

import React from 'react';
import Header from "@/app/components/fishingquiz.de/Header";
import Footer from "@/app/components/fishingquiz.de/Footer";
import CookieBanner from "@/app/components/CookieBanner";

export default function Page() {
  return (
    <>
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h1 id="datenschutzerklärung" className="text-3xl font-semibold text-gray-900 mb-4">Datenschutzerklärung</h1>
            <p className="text-gray-700 leading-relaxed mb-4">Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <img src="/impressum-address.png" alt="Adressinformationen" className="max-w-full" />
            </p>

            <h2 id="ihre-betroffenenrechte" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">
              <a href="#ihre-betroffenenrechte" className="text-blue-500 hover:text-blue-700">Ihre Betroffenenrechte</a>
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">Unter den angegebenen Kontaktdaten unseres Datenschutzbeauftragten können Sie jederzeit folgende Rechte ausüben:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li>Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen (Art. 18 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung Ihrer Daten bei uns (Art. 21 DSGVO)</li>
              <li>Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben (Art. 20 DSGVO)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Sie können sich jederzeit mit einer Beschwerde an eine Aufsichtsbehörde wenden, z. B. an die zuständige Aufsichtsbehörde des Bundeslands Ihres Wohnsitzes oder an die für uns als verantwortliche Stelle zuständige Behörde.</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Eine Liste der Aufsichtsbehörden (für den nichtöffentlichen Bereich) mit Anschrift finden Sie unter:
              <a href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html" rel="noopener noreferrer" target="_blank" className="text-blue-500 hover:text-blue-700">
                https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html
              </a>
            </p>

            <h2 id="erfassung-allgemeiner-informationen-beim-besuch-unserer-website" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">
              <a href="#erfassung-allgemeiner-informationen-beim-besuch-unserer-website" className="text-blue-500 hover:text-blue-700">Erfassung allgemeiner Informationen beim Besuch unserer Website</a>
            </h2>

            <h3 id="art-und-zweck-der-verarbeitung" className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              <a href="#art-und-zweck-der-verarbeitung" className="text-blue-500 hover:text-blue-700">Art und Zweck der Verarbeitung</a>
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">Wenn Sie auf unsere Website zugreifen, d.h., wenn Sie sich nicht registrieren oder anderweitig Informationen übermitteln, werden automatisch Informationen allgemeiner Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres Internet-Service-Providers, Ihre IP-Adresse und ähnliches.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Sie werden insbesondere zu folgenden Zwecken verarbeitet:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li>Sicherstellung eines problemlosen Verbindungsaufbaus der Website</li>
              <li>Sicherstellung einer reibungslosen Nutzung unserer Website</li>
              <li>Auswertung der Systemsicherheit und -stabilität sowie</li>
              <li>zur Optimierung unserer Website.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">Wir verwenden Ihre Daten nicht, um Rückschlüsse auf Ihre Person zu ziehen. Informationen dieser Art werden von uns ggfs. anonymisiert statistisch ausgewertet, um unseren Internetauftritt und die dahinterstehende Technik zu optimieren.</p>

            <h3 id="rechtsgrundlage-und-berechtigtes-interesse" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Rechtsgrundlage und berechtigtes Interesse</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis unseres berechtigten Interesses an der Verbesserung der Stabilität und Funktionalität unserer Website.</p>

            <h3 id="empfänger" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Empfänger</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Empfänger der Daten sind ggf. technische Dienstleister, die für den Betrieb und die Wartung unserer Webseite als Auftragsverarbeiter tätig werden.</p>

            <h3 id="drittlandtransfer" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Drittlandtransfer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die erhobenen Daten werden ggfs. in folgende Drittländer übertragen:</p>
            <p className="text-gray-700 leading-relaxed mb-4">Nein.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Folgende Datenschutzgarantien liegen vor:</p>
            <p className="text-gray-700 leading-relaxed mb-4">Angemessenheitsbeschluss EU-Kommission</p>

            <h3 id="speicherdauer" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Speicherdauer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Daten werden gelöscht, sobald diese für den Zweck der Erhebung nicht mehr erforderlich sind. Dies ist für die Daten, die der Bereitstellung der Website dienen, grundsätzlich der Fall, wenn die jeweilige Sitzung beendet ist.</p>

            <h3 id="bereitstellung-vorgeschrieben-oder-erforderlich" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Bereitstellung vorgeschrieben oder erforderlich</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Bereitstellung der vorgenannten personenbezogenen Daten ist weder gesetzlich noch vertraglich vorgeschrieben. Ohne die IP-Adresse ist jedoch der Dienst und die Funktionsfähigkeit unserer Website nicht gewährleistet. Zudem können einzelne Dienste und Services nicht verfügbar oder eingeschränkt sein. Aus diesem Grund ist ein Widerspruch ausgeschlossen.</p>

            <h2 id="cookies" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Wie viele andere Webseiten verwenden wir auch so genannte „Cookies“. Bei Cookies handelt es sich um kleine Textdateien, die auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, wenn Sie unsere Webseite besuchen.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Sie können Sie einzelne Cookies oder den gesamten Cookie-Bestand löschen. Darüber hinaus erhalten Sie Informationen und Anleitungen, wie diese Cookies gelöscht oder deren Speicherung vorab blockiert werden können. Je nach Anbieter Ihres Browsers finden Sie die notwendigen Informationen unter den nachfolgenden Links:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li>
                Mozilla Firefox:
                <a href="https://support.mozilla.org/de/kb/cookies-loeschen-daten-von-websites-entfernen" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                  https://support.mozilla.org/de/kb/cookies-loeschen-daten-von-websites-entfernen
                </a>
              </li>
              <li>
                Internet Explorer:
                <a href="https://support.microsoft.com/de-de/help/17442/windows-internet-explorer-delete-manage-cookies" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                  https://support.microsoft.com/de-de/help/17442/windows-internet-explorer-delete-manage-cookies
                </a>
              </li>
              <li>
                Google Chrome:
                <a href="https://support.google.com/accounts/answer/61416?hl=de" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                  https://support.google.com/accounts/answer/61416?hl=de
                </a>
              </li>
              <li>
                Opera:
                <a href="http://www.opera.com/de/help" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                  http://www.opera.com/de/help
                </a>
              </li>
              <li>
                Safari:
                <a href="https://support.apple.com/kb/PH17191?locale=de_DE&amp;viewlocale=de_DE" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                  https://support.apple.com/kb/PH17191?locale=de_DE&amp;viewlocale=de_DE
                </a>
              </li>
            </ul>

            <h3 id="speicherdauer-und-eingesetzte-cookies" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Speicherdauer und eingesetzte Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Soweit Sie uns durch Ihre Browsereinstellungen oder Zustimmung die Verwendung von Cookies erlauben, können folgende Cookies auf unseren Webseiten zum Einsatz kommen:</p>
            <p className="text-gray-700 leading-relaxed mb-4">* <a href="https://matomo.org/" rel="nofollow" title="Matomo" className="text-blue-500 hover:text-blue-700">Matomo</a></p>
            <p>
              Matomo ist eine Open-Source-Webanalyse-Plattform, die detaillierte Webseitenstatistiken bietet und gleichzeitig Dateneigentum und Nutzerdatenschutz priorisiert.
            </p>

            <h2 id="technisch-notwendige-cookies" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Technisch notwendige Cookies</h2>

            <h3 id="art-und-zweck-der-verarbeitung-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Art und Zweck der Verarbeitung</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Wir setzen Cookies ein, um unsere Website nutzerfreundlicher zu gestalten. Einige Elemente unserer Internetseite erfordern es, dass der aufrufende Browser auch nach einem Seitenwechsel identifiziert werden kann.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Der Zweck der Verwendung technisch notwendiger Cookies ist, die Nutzung von Websites für die Nutzer zu vereinfachen. Einige Funktionen unserer Internetseite können ohne den Einsatz von Cookies nicht angeboten werden. Für diese ist es erforderlich, dass der Browser auch nach einem Seitenwechsel wiedererkannt wird.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Für folgende Anwendungen benötigen wir Cookies:</p>

            <h3 id="rechtsgrundlage-und-berechtigtes-interesse" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Rechtsgrundlage und berechtigtes Interesse</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis unseres berechtigten Interesses an einer nutzerfreundlichen Gestaltung unserer Website.</p>

            <h3 id="empfänger-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Empfänger</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Empfänger der Daten sind ggf. technische Dienstleister, die für den Betrieb und die Wartung unserer Website als Auftragsverarbeiter tätig werden.</p>

            <h3 id="drittlandtransfer-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Drittlandtransfer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die erhobenen Daten werden in keine Drittländer übertragen.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Folgende Datenschutzgarantien liegen vor:</p>
            <p className="text-gray-700 leading-relaxed mb-4">* Angemessenheitsbeschluss EU-Kommission</p>

            <h3 id="bereitstellung-vorgeschrieben-oder-erforderlich" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Bereitstellung vorgeschrieben oder erforderlich</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Bereitstellung der vorgenannten personenbezogenen Daten ist weder gesetzlich noch vertraglich vorgeschrieben. Ohne diese Daten ist jedoch der Dienst und die Funktionsfähigkeit unserer Website nicht gewährleistet. Zudem können einzelne Dienste und Services nicht verfügbar oder eingeschränkt sein.</p>

            <h3 id="widerspruch" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Widerspruch</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Lesen Sie dazu die Informationen über Ihr Widerspruchsrecht nach Art. 21 DSGVO weiter unten.</p>

            <h2 id="technisch-nicht-notwendige-cookies" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Technisch nicht notwendige Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Des Weiteren setzen wir Cookies ein, um das Angebot auf unserer Website besser auf die Interessen unserer Besucher abzustimmen oder auf Basis statistischer Auswertungen allgemein zu verbessern.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Welche Anbieter Cookies setzen, entnehmen Sie bitte den unten aufgeführten Informationen zu den eingesetzten Darstellungs-, Tracking-, Remarketing- und Webanalyse-Technologien.</p>

            <h3 id="rechtsgrundlage" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Rechtsgrundlage</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Rechtsgrundlage für diese Verarbeitungen ist jeweils Ihre Einwilligung, Art. 6 Abs. 1 lit. a DSGVO.</p>

            <h3 id="empfänger-2" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Empfänger</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Empfänger der Daten sind ggf. technische Dienstleister, die für den Betrieb und die Wartung unserer Website als Auftragsverarbeiter tätig werden.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Weitere Empfänger entnehmen Sie bitte den unten aufgeführten Informationen zu den eingesetzten Darstellungs-, Tracking-, Remarketing- und Webanalyse-Technologien.</p>

            <h3 id="drittlandtransfer-2" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Drittlandtransfer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Informationen hierzu entnehmen Sie bitte aus den Auflistungen der einzelnen Darstellungs-, Tracking-, Remarketing- und Webanalyse-Anbietern.</p>

            <h3 id="bereitstellung-vorgeschrieben-oder-erforderlich-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Bereitstellung vorgeschrieben oder erforderlich</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Natürlich können Sie unsere Website grundsätzlich auch ohne Cookies betrachten. Webbrowser sind regelmäßig so eingestellt, dass sie Cookies akzeptieren. Im Allgemeinen können Sie die Verwendung von Cookies jederzeit über die Einstellungen Ihres Browsers deaktivieren (siehe Widerruf der Einwilligung).</p>
            <p className="text-gray-700 leading-relaxed mb-4">Bitte beachten Sie, dass einzelne Funktionen unserer Website möglicherweise nicht funktionieren, wenn Sie die Verwendung von Cookies deaktiviert haben.</p>

            <h3 id="widerruf-der-einwilligung" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Widerruf der Einwilligung</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Sie können Ihre Einwilligung jederzeit über unser Cookie-Consent-Tool widerrufen.</p>

            <h3 id="profiling" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Profiling</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Inwiefern wir das Verhalten von Websitebesuchern mit pseudonymisierten Nutzerprofilen analysieren, entnehmen Sie bitte den unten aufgeführten Informationen zu den eingesetzten Darstellungs-, Tracking-, Remarketing- und Webanalyse-Technologien.</p>

            <h2 id="kommentarfunktion" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Kommentarfunktion</h2>

            <h3 id="art-und-zweck-der-verarbeitung-2" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Art und Zweck der Verarbeitung</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Wenn Nutzer Kommentare auf unserer Website hinterlassen, werden neben diesen Angaben auch der Zeitpunkt ihrer Erstellung und der zuvor durch den Websitebesucher gewählte Nutzername gespeichert. Dies dient unserer Sicherheit, da wir für widerrechtliche Inhalte auf unserer Webseite belangt werden können, auch wenn diese durch Benutzer erstellt wurden.</p>

            <h3 id="rechtsgrundlage-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Rechtsgrundlage</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Verarbeitung der als Kommentar eingegebenen Daten erfolgt auf der Grundlage eines berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO).</p>
            <p className="text-gray-700 leading-relaxed mb-4">Durch Bereitstellung der Kommentarfunktion möchten wir Ihnen eine unkomplizierte Interaktion ermöglichen. Ihre gemachten Angaben werden zum Zwecke der Bearbeitung der Anfrage sowie für mögliche Anschlussfragen gespeichert.</p>

            <h3 id="empfänger-3" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Empfänger</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Empfänger der Daten sind ggf. Auftragsverarbeiter.</p>

            <h3 id="drittlandtransfer" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Drittlandtransfer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die erhobenen Daten werden in keine Drittländer übertragen.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Folgende Datenschutzgarantien liegen vor:</p>
            <p className="text-gray-700 leading-relaxed mb-4">* Angemessenheitsbeschluss EU-Kommission<br />* Standard-Vertragsklauseln</p>

            <h3 id="speicherdauer-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Speicherdauer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Daten werden gelöscht, sobald diese für den Zweck der Erhebung nicht mehr erforderlich sind. Dies ist grundsätzlich der Fall, wenn die Kommunikation mit dem Nutzer abgeschlossen ist und das Unternehmen den Umständen entnehmen kann, dass der betroffene Sachverhalt abschließend geklärt ist. Wir behalten uns die Löschung ohne Angaben von Gründen und ohne vorherige oder nachträgliche Information vor.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Außerdem können Sie Ihren Kommentar jederzeit durch uns löschen lassen. Schreiben Sie dafür bitte eine E-Mail an den unten aufgeführten Datenschutzbeauftragten bzw. die für den Datenschutz zuständige Person und übermitteln den Link zu Ihrem Kommentar sowie zu Identifikationszwecken die bei der Erstellung des Kommentars verwendete E-Mail-Adresse.</p>

            <h3 id="bereitstellung-vorgeschrieben-oder-erforderlich-2" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Bereitstellung vorgeschrieben oder erforderlich</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die Bereitstellung Ihrer personenbezogenen Daten erfolgt freiwillig. Ohne die Bereitstellung Ihrer personenbezogenen Daten können wir Ihnen keinen Zugang zu unserer Kommentarfunktion gewähren.</p>

            <h2 id="verwendung-von-matomo" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Verwendung von Matomo</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Soweit Sie ihre Einwilligung gegeben haben, wird auf dieser Website Matomo (vormals Piwik) eingesetzt, eine Open-Source-Software zur statistischen Auswertung von Besucherzugriffen. Anbieter der Software Matomo ist die InnoCraft Ltd., 150 Willis St, 6011 Wellington, Neuseeland.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Matomo setzt einen Cookie (eine Textdatei) auf Ihrem Endgerät, mit dem Ihr Browser wiedererkannt werden kann. Werden Unterseiten unserer Website aufgerufen, werden folgende Informationen gespeichert:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
              <li>die IP-Adresse des Nutzers, gekürzt um die letzten zwei Bytes (anonymisiert)</li>
              <li>die aufgerufene Unterseite und Zeitpunkt des Aufrufs</li>
              <li>die Seite, von der der Nutzer auf unsere Webseite gelangt ist (Referrer)</li>
              <li>welcher Browser mit welchen Plugins, welches Betriebssystem und welche Bildschirmauflösung genutzt wird</li>
              <li>die Verweildauer auf der Website</li>
              <li>die Seiten, die von der aufgerufenen Unterseite aus angesteuert werden</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">Die Verwendung von Matomo erfolgt zu dem Zweck, die Qualität unserer Website und ihre Inhalte zu verbessern. Dadurch erfahren wir, wie die Website genutzt wird und können so unser Angebot stetig optimieren.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Durch die Anonymisierung der IP-Adresse um sechs Stellen tragen wir dem Interesse des Webseitenbesuchers am Schutz personenbezogener Daten Rechnung. Die Daten werden nicht dazu genutzt, den Nutzer der Website persönlich zu identifizieren und werden nicht mit anderen Daten zusammengeführt. Die durch das Cookie erzeugten Informationen über Ihre Benutzung dieser Webseite werden nicht an Dritte weitergegeben.</p>

            <h3 id="drittlandtransfer-3" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Drittlandtransfer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Die erhobenen Daten werden in keine Drittländer übertragen.</p>

            <h3 id="widerruf-der-einwilligung-1" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Widerruf der Einwilligung</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Sie können Ihre Einwilligung zur Speicherung und Auswertung Ihrer Daten durch Matomo jederzeit über den unten aufgeführten Link widerrufen. Es wird dann ein sogenanntes Opt-Out-Cookie auf Ihrem Gerät gespeichert, das zwei Jahre Gültigkeit hat. Es hat zur Folge, dass Matomo keinerlei Sitzungsdaten erhebt. Beachten Sie allerdings, dass das Opt-Out-Cookie gelöscht wird, wenn Sie alle Cookies löschen.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Nähere Informationen zu den Privatsphäre-Einstellungen der Matomo Software finden Sie unter folgendem Link:
              <a href="https://matomo.org/docs/privacy/" rel="nofollow noopener" target="_blank" className="text-blue-500 hover:text-blue-700">
                https://matomo.org/docs/privacy/
              </a>.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Sie können die Verwendung von Cookies auch durch eine entsprechende Einstellung Ihrer Browser Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können.</p>

            <h2 id="ssl-verschlüsselung" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">SSL-Verschlüsselung</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden wir dem aktuellen Stand der Technik entsprechende Verschlüsselungsverfahren (z. B. SSL) über HTTPS.</p>

            <h2 id="information-über-ihr-widerspruchsrecht-nach-art-21-dsgvo" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Information über Ihr Widerspruchsrecht nach Art. 21 DSGVO</h2>

            <h3 id="einzelfallbezogenes-widerspruchsrecht" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Einzelfallbezogenes Widerspruchsrecht</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die aufgrund Art. 6 Abs. 1 lit. f DSGVO (Datenverarbeitung auf der Grundlage einer Interessenabwägung) erfolgt, Widerspruch einzulegen; dies gilt auch für ein auf diese Bestimmung gestütztes Profiling im Sinne von Art. 4 Nr. 4 DSGVO.</p>
            <p className="text-gray-700 leading-relaxed mb-4">Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten nicht mehr verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.</p>

            <h3 id="empfänger-eines-widerspruchs" className="text-xl font-semibold text-gray-900 mt-4 mb-2">Empfänger eines Widerspruchs</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <img src="/impressum-address.png" alt="Adressinformationen" className="max-w-full" />
            </p>

            <h2 id="änderung-unserer-datenschutzbestimmungen" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Änderung unserer Datenschutzbestimmungen</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>

            <h2 id="fragen-an-den-datenschutzbeauftragten" className="text-2xl font-semibold text-gray-900 mt-6 mb-4">Fragen an den Datenschutzbeauftragten</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail oder wenden Sie sich direkt an die für den Datenschutz verantwortliche Person in unserer Organisation:</p>

            <p className="text-gray-700 leading-relaxed mb-4"><em>Die Datenschutzerklärung wurde mithilfe der activeMind AG erstellt, den Experten für <a href="https://www.activemind.de/datenschutz/datenschutzbeauftragter/" rel="noopener" target="_blank" className="text-blue-500 hover:text-blue-700">externe Datenschutzbeauftragte</a> (Version #2020-09-30).</em>
            </p>
          </div>
        </div>
      </div>
      <CookieBanner />
      <Footer />
    </>
  );
}
