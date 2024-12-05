<?php

namespace App\Command;

use App\Domain\PerplexityService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:fetch-questions',
    description: 'Fetch questions from AI.',
)]
class FetchQuestionsCommand extends Command
{
    public function __construct(private readonly PerplexityService $perplexityService)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->perplexityService->fetchAll();
        return Command::SUCCESS;
    }
}
