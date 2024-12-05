<?php

declare(strict_types=1);

namespace App\Domain;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PerplexityService
{
    public function __construct(
        #[Autowire('%api_key_perplexity%')]
        private readonly string $apiKey,
        private readonly HttpClientInterface $httpClient
    )
    {
    }

    public function fetchAll(): void {
        $category = 'AfD';
        $difficulty = 'low';

        $response = $this->httpClient->request('POST', 'https://api.perplexity.ai/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'model' => 'llama-3.1-sonar-small-128k-online',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => 'Generiere 10 trivia Fragen mit 3 Optionen im JSON Format. Die Kategorie ist ' . $category . ' und der Schwierigkeitsgrad: ' . $difficulty . '. Bitte achte auf korrekte deutsche Rechtschreibung. Hier ist ein Beispiel für den Aufbau: ' .
                            '{"question": "Welchen ungewöhnlichen Beruf hatte Tino Chrupalla vor seiner politischen Karriere?",' .
                            '"options": ["Malermeister", "Zirkusclown", "Imker"],' .
                            '"correctIndex": 0,' .
                            '"explanation": "Tino Chrupalla war vor seiner politischen Karriere als Malermeister tätig."}',
                    ],
                ],
            ],
        ]);

        $result = $response->toArray();
        xdebug_break();
    }

}